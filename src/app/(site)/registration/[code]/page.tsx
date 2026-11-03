import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { supabaseService } from '@/lib/supabase/service';
import { fmt } from '@/lib/format';
export const dynamic = 'force-dynamic';
export default async function Confirmation({ params }: { params: { code: string } }) {
  if (!/^AGG-[0-9A-Fa-f]{20}$/.test(params.code)) notFound();
  const h = headers();
  const ip = (h.get('x-real-ip') || h.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const key = 'lookup:' + createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? '')).digest('hex').slice(0, 32);
  const sb = supabaseService();
  const { data: allowed, error: limitError } = await sb.rpc('check_rate_limit', { p_key: key, p_limit: 20, p_window: 600 });
  if (limitError || !allowed) notFound();
  const { data } = await sb.rpc('get_registration_public', { p_code: params.code });
  const r = data?.[0]; if (!r) notFound();
  return (<main className="wrap py-14"><div className="card rise mx-auto max-w-xl text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-2xl text-green-800">✓</div>
    <h1 className="text-3xl">Registration received</h1>
    <p className="mt-2 text-muted">Save this ID. You will need it if you contact the organizer.</p>
    <div className="my-6 rounded-2xl bg-paper p-5"><div className="text-xs font-bold tracking-widest text-muted">REGISTRATION ID</div><div className="mt-1 text-3xl font-extrabold tracking-wider">{params.code.toUpperCase()}</div></div>
    <dl className="grid gap-2.5 text-left text-sm">
      <div className="flex justify-between"><dt className="text-muted">Team</dt><dd className="font-bold">{r.team_name}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Tournament</dt><dd className="font-bold">{r.tournament_title} ({r.game_name})</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Starts</dt><dd className="font-bold">{fmt(r.starts_at)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><span className={`st ${r.status === 'approved' ? 'ok' : r.status === 'rejected' ? 'bad' : 'wait'}`}>{r.status === 'pending' ? 'Pending approval' : r.status}</span></dd></div>
    </dl><Link href="/" className="btn mt-6">Back to tournaments</Link></div></main>);
}
