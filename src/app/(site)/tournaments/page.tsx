import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { fmt, gameColor, slotInfo, type PublicTournament } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Esports Tournaments | Free Fire MAX, BGMI & Valorant',
  description: 'Explore community esports tournaments on ARENAGG. Find Free Fire MAX, BGMI and Valorant competitions, check schedules and rules, and register your team.',
  alternates: { canonical: '/tournaments' },
  openGraph: {
    type: 'website',
    title: 'Esports Tournaments | ARENAGG',
    description: 'Explore Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG.',
    url: '/tournaments',
  },
};

export default async function TournamentsPage() {
  const sb = supabaseServer();
  const { data: games } = await sb.from('games').select('slug,name').order('name');
  const { data, error } = await sb
    .from('tournament_public')
    .select('*')
    .in('status', ['open', 'closed', 'live', 'completed'])
    .order('starts_at');
  const ts = (data ?? []) as PublicTournament[];

  return (
    <main className="arena-page min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#102849] via-[#0b1930] to-[#070e1d] p-7 shadow-2xl shadow-blue-950/30 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-black tracking-[0.28em] text-cyan-300">FIND YOUR NEXT MATCH</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Esports Tournaments</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose your game, build your squad and compete. Browse tournament schedules, entry details, available slots and rules before registering.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="arena-badge">🎮 {games?.length ?? 0} games</span>
              <span className="arena-badge">🏆 {ts.length} tournaments</span>
              <Link href="/results" className="arena-glass-secondary">View results →</Link>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-cyan-300">THE COMPETITION</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Available tournaments</h2>
            </div>
            <p className="text-sm text-slate-400">Showing {ts.length} tournament{ts.length === 1 ? '' : 's'}</p>
          </div>

          <div className="mb-7 flex flex-wrap gap-2">
            <Link className="arena-filter" href="/">All games</Link>
            {(games ?? []).map((g) => (
              <Link key={g.slug} className="arena-filter" href={`/?game=${g.slug}#tournaments`}>{g.name}</Link>
            ))}
          </div>

          {error ? (
            <div className="arena-glass rounded-2xl p-8 text-center" role="status">
              <h3 className="text-lg font-bold text-white">Tournaments are temporarily unavailable</h3>
              <p className="mt-2 text-sm text-slate-400">Please refresh the page or try again shortly.</p>
            </div>
          ) : ts.length ? (
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ts.map((t) => {
                const s = slotInfo(t);
                const statusClass = s.canRegister ? 'ok' : t.status === 'cancelled' ? 'bad' : t.status === 'live' ? 'info' : 'gray';
                return (
                  <article key={t.id} className="arena-tournament flex h-full min-w-0 flex-col rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black tracking-[0.16em]" style={{ color: gameColor(t.game_slug) }}>{t.game_name.toUpperCase()}</span>
                      <span className={`st ${statusClass}`}>{s.label}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-black leading-snug text-white">
                      <Link className="hover:text-cyan-200" href={`/tournaments/${t.id}`}>{t.title}</Link>
                    </h3>
                    {t.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{t.description}</p> : <p className="mt-2 text-sm text-slate-400">Get your team ready and compete in this community tournament.</p>}
                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Starts</p><p className="mt-1 text-sm font-semibold text-slate-200">{fmt(t.starts_at)}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team format</p><p className="mt-1 text-sm font-semibold text-slate-200">{t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entry fee</p><p className="mt-1 text-sm font-semibold text-slate-200">{t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team slots</p><p className="mt-1 text-sm font-semibold text-slate-200">{t.registered}/{t.max_teams} registered</p></div>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs text-slate-400"><span>Registration capacity</span><span>{Math.min(100, Math.round((t.registered / Math.max(1, t.max_teams)) * 100))}%</span></div>
                      <div className="bar"><i style={{ width: `${Math.min(100, (t.registered / Math.max(1, t.max_teams)) * 100)}%` }} /></div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Link href={`/tournaments/${t.id}`} className="btn light sm flex-1">Details &amp; rules</Link>
                      {s.canRegister && <Link href={`/register/${t.id}`} className="btn sm flex-1">Register now →</Link>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="arena-glass rounded-2xl px-5 py-14 text-center">
              <div className="text-4xl" aria-hidden="true">🏆</div>
              <h3 className="mt-4 text-xl font-black text-white">No tournaments available right now</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">New competitions will appear here when the organizer publishes them. Join our WhatsApp channel for announcements.</p>
              <a className="arena-glass-button mt-5" href="https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q" target="_blank" rel="noopener noreferrer">Join WhatsApp Channel ↗</a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
