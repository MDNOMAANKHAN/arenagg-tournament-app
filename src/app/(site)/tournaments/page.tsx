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

/**
 * All tournaments list.
 *
 * This route used to be a copy of the detail page that read `params.id`
 * (undefined at /tournaments) and called notFound() — so the URL always 404'd.
 */
export default async function TournamentsPage() {
  const sb = supabaseServer();

  const { data: games } = await sb.from('games').select('slug,name').order('name');

  const { data } = await sb
    .from('tournament_public')
    .select('*')
    .in('status', ['open', 'closed', 'live', 'completed'])
    .order('starts_at');

  const ts = (data ?? []) as PublicTournament[];

  return (
    <main className="wrap py-10">
      <div className="text-xs font-bold tracking-widest text-accd">
        ALL COMPETITIONS
      </div>

      <h1 className="mb-2 mt-1 text-4xl font-black">Tournaments</h1>

      <p className="mb-6 text-sm text-muted">
        {ts.length} tournament{ts.length === 1 ? '' : 's'} across{' '}
        {(games ?? []).length} games.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link className="btn light sm" href="/">
          ← Back to home
        </Link>

        {(games ?? []).map((g) => (
          <Link
            key={g.slug}
            className="btn light sm"
            href={`/?game=${g.slug}#tournaments`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      {ts.length ? (
        <div className="grid gap-4">
          {ts.map((t) => {
            const s = slotInfo(t);

            return (
              <article key={t.id} className="card group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
                <Link
                  href={`/tournaments/${t.id}`}
                  aria-label={`View full details for ${t.title}`}
                  className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
                />
                <div className="pointer-events-none relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-black tracking-widest"
                    style={{ color: gameColor(t.game_slug) }}
                  >
                    {t.game_name.toUpperCase()}
                  </span>

                  <span
                    className={`st ${
                      s.canRegister
                        ? 'ok'
                        : t.status === 'cancelled'
                        ? 'bad'
                        : t.status === 'live'
                        ? 'info'
                        : 'gray'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-black text-white transition-colors group-hover:text-cyan-300">
                  {t.title}
                </h2>

                <p className="mt-2 text-sm text-muted">
                  {fmt(t.starts_at)} ·{' '}
                  {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`} ·{' '}
                  {t.registered}/{t.max_teams} teams ·{' '}
                  {t.entry_fee > 0 ? `₹${t.entry_fee} entry` : 'Free entry'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300">
                    View tournament details →
                  </span>

                  {s.canRegister && (
                    <Link href={`/register/${t.id}`} className="btn sm pointer-events-auto relative z-20">
                      Register now →
                    </Link>
                  )}
                </div>
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
