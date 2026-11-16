import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import {
  fmt,
  gameColor,
  slotInfo,
  type PublicTournament,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Esports Tournaments | Free Fire MAX, BGMI & Valorant',
  description:
    'Explore community esports tournaments on ARENAGG. Find Free Fire MAX, BGMI and Valorant competitions, check schedules and rules, and register your team.',
  alternates: { canonical: '/tournaments' },
  openGraph: {
    type: 'website',
    title: 'Esports Tournaments | ARENAGG',
    description:
      'Explore Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG.',
    url: '/tournaments',
  },
};

export default async function TournamentsPage() {
  const sb = supabaseServer();

  const { data: games } = await sb.from('games').select('slug,name').order('name');

  const { data } = await sb
    .from('tournament_public')
    .select('*')
    .in('status', ['open', 'closed', 'live', 'completed'])
    .order('starts_at');

  const tournaments = (data ?? []) as PublicTournament[];

  return (
    <main className="arena-page relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <section className="mb-10 mt-4 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.3em] text-cyan-300">
              COMPETE NOW
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Tournaments
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Find your next competition, check the details and bring your team to victory.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-400">
              {tournaments.length} tournament{tournaments.length === 1 ? '' : 's'} across {(games ?? []).length} games.
            </p>
          </div>

          <Link
            href="/"
            className="arena-glass-button arena-glass-secondary w-fit"
          >
            ← Back to Home
          </Link>
        </section>

        <section aria-label="Filter tournaments by game" className="mb-8">
          <p className="mb-3 text-xs font-black tracking-[0.2em] text-cyan-300">
            CHOOSE YOUR GAME
          </p>
          <div className="flex flex-wrap gap-2">
            {(games ?? []).map((game) => (
              <Link
                key={game.slug}
                href={`/?game=${game.slug}#tournaments`}
                className="arena-glass-button arena-glass-secondary rounded-xl"
              >
                {game.name}
              </Link>
            ))}
          </div>
        </section>

        {tournaments.length ? (
          <section
            aria-label="Available tournaments"
            className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tournaments.map((tournament, index) => {
              const slots = slotInfo(tournament);
              const maxTeams = Math.max(Number(tournament.max_teams) || 0, 0);
              const registered = Math.max(Number(tournament.registered) || 0, 0);
              const progress = maxTeams > 0
                ? Math.min((registered / maxTeams) * 100, 100)
                : 0;

              return (
                <article
                  key={tournament.id}
                  className="arena-premium-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#101d35]/90 to-[#080f20]/90 p-6 shadow-lg shadow-blue-950/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-xl hover:shadow-cyan-500/10"
                  style={{
                    animation: 'fadeInUp .6s ease-out both',
                    animationDelay: `${Math.min(index * 90, 540)}ms`,
                  }}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="text-xs font-black tracking-[0.16em]"
                      style={{ color: gameColor(tournament.game_slug) }}
                    >
                      {tournament.game_name.toUpperCase()}
                    </span>
                    <span
                      className={`st ${
                        slots.canRegister
                          ? 'ok'
                          : tournament.status === 'cancelled'
                            ? 'bad'
                            : tournament.status === 'live'
                              ? 'info'
                              : 'gray'
                      }`}
                    >
                      {slots.label}
                    </span>
                  </div>

                  <h2 className="min-h-[3.5rem] text-xl font-black leading-snug text-white transition group-hover:text-cyan-200">
                    <Link href={`/tournaments/${tournament.id}`}>
                      {tournament.title}
                    </Link>
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {fmt(tournament.starts_at)}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-blue-200/10 bg-blue-300/[0.05] p-3">
                      <p className="text-[10px] font-black tracking-wider text-slate-400">TEAM FORMAT</p>
                      <p className="mt-1 text-sm font-extrabold text-white">
                        {tournament.team_size === 1 ? 'Solo' : `Squad of ${tournament.team_size}`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-blue-200/10 bg-blue-300/[0.05] p-3">
                      <p className="text-[10px] font-black tracking-wider text-slate-400">ENTRY FEE</p>
                      <p className="mt-1 text-sm font-extrabold text-white">
                        {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-400">Team slots</span>
                      <span className="font-black tabular-nums text-white">
                        {registered}{maxTeams > 0 ? ` / ${maxTeams}` : ''}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="arena-glass-button arena-glass-secondary min-w-0 flex-1 text-sm"
                    >
                      Details &amp; rules
                    </Link>
                    {slots.canRegister && (
                      <Link
                        href={`/register/${tournament.id}`}
                        className="arena-glass-button min-w-0 flex-1 text-sm"
                      >
                        Register →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="arena-premium-card relative overflow-hidden rounded-2xl border border-blue-300/15 bg-[#0b1424]/80 px-5 py-16 text-center shadow-xl shadow-blue-950/20 backdrop-blur-xl">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[70px]" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-4xl shadow-lg shadow-cyan-500/10">
              🏆
            </div>
            <h2 className="relative mt-6 text-xl font-black text-white">
              No tournaments available
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
              No tournaments are open right now. Check back soon for upcoming competitions.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
