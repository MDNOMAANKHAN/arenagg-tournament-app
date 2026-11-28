import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';

const schema = z.object({
  status: z.enum(['pending','identity_verification','in_review','completed','declined']),
  admin_notes: z.string().trim().max(2000).default(''),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid request reference.' }, { status: 400 });
  }
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const raw = await req.text().catch(() => '');
  if (new TextEncoder().encode(raw).byteLength > 4000) return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status or notes.' }, { status: 422 });

  const { data, error } = await admin.sb.from('privacy_requests')
    .update(parsed.data).eq('id', id
    .select('id,status').maybeSingle();
  if (error) {
    console.error('Privacy request update failed', error.message);
    return NextResponse.json({ error: 'Could not update this request.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, request: data });
}
