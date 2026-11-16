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
    <main className="wrap py-10">
      <div className="text-xs font-bold tracking-widest text-accd">
        ALL COMPETITIONS
      </div>

      <h1 className="mb-2 mt-1 text-4xl font-black">Tournaments</h1>

      <p className="mb-6 text-sm text-muted">
        {tournaments.length} tournament{tournaments.length === 1 ? '' : 's'} across{' '}
        {(games ?? []).length} games.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link className="btn light sm" href="/">
          ← Back to home
        </Link>

        {(games ?? []).map((game) => (
          <Link
            key={game.slug}
            className="btn light sm"
            href={`/?game=${game.slug}#tournaments`}
          >
            {game.name}
          </Link>
        ))}
      </div>

      {tournaments.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => {
            const slots = slotInfo(tournament);

            return (
              <article key={tournament.id} className="card flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-black tracking-widest"
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

                <h2 className="mt-2 text-xl font-black leading-snug">
                  <Link href={`/tournaments/${tournament.id}`}>
                    {tournament.title}
                  </Link>
                </h2>

                <p className="mt-3 text-sm text-muted">
                  {fmt(tournament.starts_at)}
                </p>

                <p className="mt-2 text-sm text-muted">
                  {tournament.team_size === 1
                    ? 'Solo'
                    : `Squad of ${tournament.team_size}`}
                  {' · '}
                  {tournament.registered}/{tournament.max_teams} teams
                  {' · '}
                  {tournament.entry_fee > 0
                    ? `₹${tournament.entry_fee} entry`
                    : 'Free entry'}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="btn light sm"
                  >
                    Details &amp; rules
                  </Link>

                  {slots.canRegister && (
                    <Link href={`/register/${tournament.id}`} className="btn sm">
                      Register now →
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card text-center text-muted">
          No tournaments are open right now. Check back soon.
        </div>
      )}
    </main>
  );
}
