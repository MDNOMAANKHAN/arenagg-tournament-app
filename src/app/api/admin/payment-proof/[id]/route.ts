import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';
import { supabaseService } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams a team's payment screenshot to a signed-in admin.
 * The bucket is private, so a raw storage URL would 400 for everyone including
 * the organiser; this route is the only way in.
 */
export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(context.params.id).success) {
    return NextResponse.json({ error: 'Invalid registration ID.' }, { status: 400 });
  }

  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { data: reg, error } = await admin.sb
    .from('registrations')
    .select('payment_proof_path')
    .eq('id', context.params.id)
    .maybeSingle();

  if (error) {
    console.error('Payment proof lookup failed', error.message);
    return NextResponse.json({ error: 'Could not load the proof.' }, { status: 500 });
  }
  if (!reg?.payment_proof_path) {
    return NextResponse.json({ error: 'No payment screenshot for this team.' }, { status: 404 });
  }

  const { data: file, error: downloadError } = await supabaseService()
    .storage.from('payment-proofs')
    .download(reg.payment_proof_path);

  if (downloadError || !file) {
    console.error('Payment proof download failed', downloadError?.message);
    return NextResponse.json({ error: 'Could not load the proof.' }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
