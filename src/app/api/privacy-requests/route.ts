import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { supabaseService } from '@/lib/supabase/service';

const schema = z.object({
  request_type: z.enum(['access', 'correction', 'deletion', 'other']),
  requester_name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(5).max(120),
  registration_code: z.string().trim().max(40).optional().default(''),
  details: z.string().trim().min(10).max(2000),
  website: z.string().optional().default(''),
});

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host).split(',')[0].trim().toLowerCase();
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const raw = await req.text().catch(() => '');
  if (new TextEncoder().encode(raw).byteLength > 5000) return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the request details.' }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ error: 'Request rejected.' }, { status: 400 });

  const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128);
  const salt = process.env.RATE_LIMIT_SALT ?? '';
  const key = 'privacy:' + createHash('sha256').update(ip + salt).digest('hex').slice(0, 32);
  const sb = supabaseService();
  const { data: allowed, error: rateError } = await sb.rpc('check_rate_limit', { p_key: key, p_limit: 3, p_window: 3600 });
  if (rateError || !allowed) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });

  const { website, ...request } = parsed.data;
  const { data, error } = await sb.from('privacy_requests').insert({
    ...request,
    registration_code: request.registration_code || null,
  }).select('id').single();
  if (error || !data) {
    console.error('Privacy request intake failed', error?.message);
    return NextResponse.json({ error: 'Could not submit the request. Please contact support.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, reference: data.id }, { status: 201 });
}
