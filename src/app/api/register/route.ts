import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { registerSchema } from '@/lib/validation';
import { supabaseService } from '@/lib/supabase/service';

const MSG: Record<string, [number, string]> = {
  CLOSED: [409, 'Registration is closed for this tournament.'],
  FULL: [409, 'This tournament is full.'],
  TEAM_SIZE: [422, 'Wrong number of players for this tournament.'],
  DUPLICATE_TEAM: [409, 'A team with this name is already registered.'],
  DUPLICATE_ID: [409, 'One or more gaming IDs are already registered in this tournament.'],
  INVALID_REGISTRATION: [422, 'Please complete all required registration details.'],
};
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : new URL(req.url).origin;
  if (origin && origin !== expectedOrigin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 20_000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

  const rawBody = await req.text().catch(() => '');
  if (new TextEncoder().encode(rawBody).byteLength > 20_000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  let body: unknown = null;
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please fix the highlighted problems.', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  const { website, t, ...payload } = parsed.data;
  if (website || !Number.isFinite(t)) return NextResponse.json({ error: 'Request rejected.' }, { status: 400 }); // honeypot; do not reject fast autofill or mobile submissions

  // Prefer the hosting platform's normalized client-IP header. Configure trusted proxy headers at deployment.
  const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128);
  const key = 'reg:' + createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? '')).digest('hex').slice(0, 32);
  const sb = supabaseService();
  const { data: ok } = await sb.rpc('check_rate_limit', { p_key: key, p_limit: 5, p_window: 600 });
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });

  const { data, error } = await sb.rpc('register_team', { p: payload });
  if (error) {
    const hit = Object.keys(MSG).find((k) => error.message.includes(k));
    if (hit) return NextResponse.json({ error: MSG[hit][1] }, { status: MSG[hit][0] });
    console.error('register_team failed', error.message);
    return NextResponse.json({ error: 'Could not register right now.' }, { status: 500 });
  }
  return NextResponse.json({ code: data }, { status: 201 });
}
