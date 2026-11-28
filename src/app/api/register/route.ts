import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import { registerSchema } from '@/lib/validation';
import { supabaseService } from '@/lib/supabase/service';

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const MSG: Record<string, [number, string]> = {
  CLOSED: [409, 'Registration is closed for this tournament.'],
  FULL: [409, 'This tournament is full.'],
  TEAM_SIZE: [422, 'Wrong number of players for this tournament.'],
  DUPLICATE_TEAM: [409, 'A team with this name is already registered.'],
  DUPLICATE_ID: [409, 'One or more gaming IDs are already registered in this tournament.'],
  INVALID_REGISTRATION: [422, 'Please complete all required registration details.'],
  LEGAL_ACCEPTANCE_REQUIRED: [422, 'Please accept the current Terms & Conditions and Privacy Policy before registering.'],
};

function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;
  const candidate = value.split(',')[0].trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
    return url.host.toLowerCase();
  } catch {
    return null;
  }
}

function hasValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const parsedOrigin = new URL(origin);
    const isLocalhost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
    if (parsedOrigin.protocol !== 'https:' && !isLocalhost) return false;
    const allowedHosts = new Set(
      [
        req.headers.get('x-forwarded-host'),
        req.headers.get('host'),
        req.nextUrl.host,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.SITE_URL,
        process.env.VERCEL_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
      ].map(normalizeHost).filter((host): host is string => Boolean(host))
    );
    return allowedHosts.has(parsedOrigin.host.toLowerCase());
  } catch {
    return false;
  }
}

/** Verify the file signature rather than trusting the browser-provided MIME type. */
function sniff(buf: Buffer): string | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const length = Number(req.headers.get('content-length') || 0);
  if (length > MAX_BYTES + 100_000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

  const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128);
  const key = 'reg:' + createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? '')).digest('hex').slice(0, 32);
  const { data: ok } = await sb.rpc('check_rate_limit', { p_key: key, p_limit: 5, p_window: 600 });
  if (!ok) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid registration form.' }, { status: 400 });
  }

  const rawRegistration = form.get('registration');
  if (typeof rawRegistration !== 'string' || rawRegistration.length > 20_000) {
    return NextResponse.json({ error: 'Registration details are missing or too large.' }, { status: 400 });
  }

  let body: unknown;
  try { body = JSON.parse(rawRegistration); } catch {
    return NextResponse.json({ error: 'Invalid registration details.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please fix the highlighted problems.', fields: parsed.error.flatten().fieldErrors }, { status: 422 });

  const { website, t, ...payload } = parsed.data;
  if (website || !Number.isFinite(t)) return NextResponse.json({ error: 'Request rejected.' }, { status: 400 });

  const proofFile = form.get('payment_screenshot');
  const utrRaw = form.get('payment_utr');
  const utr = typeof utrRaw === 'string' ? utrRaw.trim().slice(0, 40) : '';

  const sb = supabaseService();
  const { data: tournament, error: tournamentError } = await sb
    .from('tournaments')
    .select('id,entry_fee')
    .eq('id', payload.tournament_id)
    .maybeSingle();

  if (tournamentError || !tournament) {
    return NextResponse.json({ error: 'Tournament not found. Please refresh and try again.' }, { status: 404 });
  }

  const isPaid = Number(tournament.entry_fee || 0) > 0;
  let proofPath: string | null = null;
  let proofBuffer: Buffer | null = null;
  let proofMime: string | null = null;

  if (isPaid) {
    if (!(proofFile instanceof File) || proofFile.size === 0) {
      return NextResponse.json({ error: 'Payment screenshot is required for paid tournaments.' }, { status: 422 });
    }
    if (proofFile.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Screenshot is too large. Maximum size is 5 MB.' }, { status: 413 });
    }
    if (utr.length < 6) {
      return NextResponse.json({ error: 'Enter the UPI transaction reference / UTR (at least 6 characters).' }, { status: 422 });
    }
    proofBuffer = Buffer.from(await proofFile.arrayBuffer());
    proofMime = sniff(proofBuffer);
    if (!proofMime) {
      return NextResponse.json({ error: 'Upload a PNG, JPG or WEBP screenshot of the payment.' }, { status: 422 });
    }
  }



  // Upload the proof before creating the registration. If upload fails, no team
  // registration is created. The object is removed if registration creation fails.
  if (isPaid && proofBuffer && proofMime) {
    proofPath = `${tournament.id}/pending/${randomUUID()}.${EXT[proofMime]}`;
    const { error: uploadError } = await sb.storage.from('payment-proofs').upload(proofPath, proofBuffer, {
      contentType: proofMime,
      upsert: false,
      cacheControl: '3600',
    });
    if (uploadError) {
      console.error('Registration proof upload failed', uploadError.message);
      return NextResponse.json({ error: 'Payment screenshot upload failed. Please try again.' }, { status: 500 });
    }
  }

  const { data: code, error: registrationError } = await sb.rpc('register_team', { p: payload });
  if (registrationError) {
    if (proofPath) await sb.storage.from('payment-proofs').remove([proofPath]);
    const hit = Object.keys(MSG).find((k) => registrationError.message.includes(k));
    if (hit) return NextResponse.json({ error: MSG[hit][1] }, { status: MSG[hit][0] });
    console.error('register_team failed', registrationError.message);
    return NextResponse.json({ error: 'Could not register right now.' }, { status: 500 });
  }

  if (proofPath) {
    const { error: proofSaveError } = await sb.from('registrations').update({
      payment_proof_path: proofPath,
      payment_proof_uploaded_at: new Date().toISOString(),
      payment_utr: utr,
    }).eq('reg_code', code);

    if (proofSaveError) {
      await sb.storage.from('payment-proofs').remove([proofPath]);
      // Roll back the newly-created registration so it cannot exist without proof.
      const { error: rollbackError } = await sb.from('registrations').delete().eq('reg_code', code);
      console.error('Registration payment proof save failed', proofSaveError.message, rollbackError?.message || '');
      return NextResponse.json({ error: 'We could not save your payment proof, so your registration was not completed. Please try submitting again.' }, { status: 500 });
    }
  }

  return NextResponse.json({ code }, { status: 201 });
}
