import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import RegisterForm from '@/components/RegisterForm';
import { fmt, gameColor, slotInfo, type PublicTournament } from '@/lib/format';
export const dynamic = 'force-dynamic';
export default async function RegisterPage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id)) notFound();
  const { data } = await supabaseServer().from('tournament_public').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const t = data as PublicTournament, s = slotInfo(t);
  return (<main className="wrap py-10">
    <div className="rise"><div className="text-xs font-bold tracking-widest" style={{ color: gameColor(t.game_slug) }}>{t.game_name.toUpperCase()} · REGISTRATION</div><h1 className="mb-1 mt-1 text-4xl">{t.title}</h1><p className="mb-6 text-muted">{fmt(t.starts_at)} · {s.label} · Free entry</p></div>
    {s.canRegister ? <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]"><RegisterForm tournament={{ id: t.id, team_size: t.team_size }} />
      <aside className="card rise" style={{ '--i': 2 } as React.CSSProperties}><h3 className="text-[17px]">What happens next</h3><ol className="mt-2.5 list-decimal pl-5 text-[13px] leading-8 text-muted"><li>You get a unique registration ID.</li><li>The organizer reviews and approves your team.</li><li>Match details are shared on the tournament page.</li></ol></aside></div>
      : <div className="card max-w-xl"><b>{s.label}.</b> <Link className="text-accd underline" href={`/tournaments/${t.id}`}>Back to tournament</Link></div>}
  </main>);
}
