import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseService } from '@/lib/supabase/service';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const CODE_RE = /^AGG-[0-9A-Fa-f]{20}$/;

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** Detect the real image type from the file signature instead of trusting the browser. */
function sniff(buf: Buffer): string | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req: NextRequest, context: { params: { code: string } }) {
  const code = context.params.code;

  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: 'Invalid registration ID.' }, { status: 404 });
  }

  // Same-origin only, same reasoning as /api/register.
  const origin = req.headers.get('origin');
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : new URL(req.url).origin;
  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const length = Number(req.headers.get('content-length') || 0);
  if (length > MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'Screenshot is too large. Maximum size is 5 MB.' }, { status: 413 });
  }

  const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 128);
  const key =
    'proof:' + createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? '')).digest('hex').slice(0, 32);

  const sb = supabaseService();

  const { data: allowed } = await sb.rpc('check_rate_limit', { p_key: key, p_limit: 10, p_window: 600 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many uploads. Try again in a few minutes.' }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose a screenshot of your payment.' }, { status: 422 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'That file is empty.' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Screenshot is too large. Maximum size is 5 MB.' }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniff(buf);
  if (!mime) {
    return NextResponse.json(
      { error: 'Upload a PNG, JPG or WEBP screenshot of the payment.' },
      { status: 422 }
    );
  }

  const utrRaw = form.get('utr');
  const utr = typeof utrRaw === 'string' ? utrRaw.trim().slice(0, 40) : '';

  const { data: reg, error: regError } = await sb
    .from('registrations')
    .select('id,tournament_id,status,payment_proof_path')
    .eq('reg_code', code.toUpperCase())
    .maybeSingle();

  if (regError) {
    console.error('Payment proof lookup failed', regError.message);
    return NextResponse.json({ error: 'Could not upload right now.' }, { status: 500 });
  }
  if (!reg) {
    return NextResponse.json({ error: 'Registration not found.' }, { status: 404 });
  }
  if (reg.status === 'rejected') {
    return NextResponse.json(
      { error: 'This registration was rejected, so a payment proof can no longer be submitted.' },
      { status: 409 }
    );
  }

  const path = `${reg.tournament_id}/${reg.id}/${Date.now()}.${EXT[mime]}`;

  const { error: uploadError } = await sb.storage.from('payment-proofs').upload(path, buf, {
    contentType: mime,
    upsert: false,
    cacheControl: '3600',
  });

  if (uploadError) {
    console.error('Payment proof upload failed', uploadError.message);
    return NextResponse.json({ error: 'Could not upload the screenshot. Please try again.' }, { status: 500 });
  }

  const { error: updateError } = await sb
    .from('registrations')
    .update({
      payment_proof_path: path,
      payment_proof_uploaded_at: new Date().toISOString(),
      ...(utr ? { payment_utr: utr } : {}),
    })
    .eq('id', reg.id);

  if (updateError) {
    // Don't leave an orphan object behind if the row update failed.
    await sb.storage.from('payment-proofs').remove([path]);
    console.error('Payment proof save failed', updateError.message);
    return NextResponse.json({ error: 'Could not save the screenshot. Please try again.' }, { status: 500 });
  }

  // Best effort: drop the previous proof so a re-upload doesn't pile up files.
  if (reg.payment_proof_path && reg.payment_proof_path !== path) {
    await sb.storage.from('payment-proofs').remove([reg.payment_proof_path]);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
