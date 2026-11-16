import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { gameColor } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Esports Tournament Results',
  description:
    'View published ARENAGG tournament results, team placements, points and kills across community esports competitions.',
  alternates: { canonical: '/results' },
  openGraph: {
    type: 'website',
    title: 'Esports Tournament Results | ARENAGG',
    description:
      'Check published placements and tournament results on ARENAGG.',
    url: '/results',
  },
};

type PublicResult = {
  tournament_id: string;
  title: string;
  game_name: string;
  game_slug: string;
  team_name: string;
  placement: number;
  points: number;
  kills: number;
};

export default async function Results() {
  const { data, error } = await supabaseServer()
    .from('results_public')
    .select('*')
    .order('placement');

  const groups = new Map<
    string,
    { title: string; game: string; slug: string; rows: PublicResult[] }
  >();

  ((data ?? []) as PublicResult[]).forEach((result) => {
    if (!groups.has(result.tournament_id)) {
      groups.set(result.tournament_id, {
        title: result.title,
        game: result.game_name,
        slug: result.game_slug,
        rows: [],
      });
    }

    groups.get(result.tournament_id)!.rows.push(result);
  });

  return (
    <main className="arena-page min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
      <header className="mb-9 rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#102849] via-[#0b1930] to-[#070e1d] p-7 shadow-2xl shadow-blue-950/30 sm:p-10 lg:p-12">
        <div className="text-xs font-black tracking-[0.24em] text-cyan-300">
          OFFICIAL STANDINGS
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Tournament Results
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Follow the teams, placements, points and kills from published ARENAGG
          community competitions. Results appear here after the organizer publishes them.
        </p>
      </header>

      {error ? (
        <section
          className="arena-glass rounded-2xl border border-amber-400/20 p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-lg font-bold text-white">Results are temporarily unavailable</h2>
          <p className="mt-2 text-sm text-slate-400">
            Please try again in a little while.
          </p>
        </section>
      ) : groups.size === 0 ? (
        <section className="arena-glass rounded-2xl py-14 text-center">
          <div className="text-3xl" aria-hidden="true">🏆</div>
          <h2 className="mt-3 text-lg font-bold text-white">No results published yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Completed tournament standings will appear here after they are
            published by the organizer.
          </p>
        </section>
      ) : (
        <div className="grid gap-5">
          {[...groups.entries()].map(([id, tournament]) => (
            <section
              key={id}
              className="arena-tournament min-w-0 overflow-hidden rounded-2xl p-0"
              aria-labelledby={`results-${id}`}
            >
              <div className="border-b border-white/10 bg-white/[0.02] p-5 sm:p-6">
                <div
                  className="text-[11px] font-black tracking-[0.18em]"
                  style={{ color: gameColor(tournament.slug) }}
                >
                  {tournament.game.toUpperCase()}
                </div>
                <h2
                  id={`results-${id}`}
                  className="mt-2 break-words text-xl font-black text-white sm:text-2xl"
                >
                  {tournament.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {tournament.rows.length} published result
                  {tournament.rows.length === 1 ? '' : 's'}
                </p>
              </div>

              <div
                className="overflow-x-auto"
                role="region"
                aria-label={`Results table for ${tournament.title}`}
                tabIndex={0}
              >
                <table className="w-full min-w-[440px]">
                  <caption className="sr-only">
                    Final standings for {tournament.title}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="whitespace-nowrap">Place</th>
                      <th scope="col">Team</th>
                      <th scope="col" className="text-right">Points</th>
                      <th scope="col" className="text-right">Kills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.rows.map((result) => (
                      <tr key={result.team_name}>
                        <td className="whitespace-nowrap">
                          <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-1 font-black text-cyan-200">
                            #{result.placement}
                          </span>
                        </td>
                        <td className="max-w-[220px] break-words font-semibold">
                          {result.team_name}
                        </td>
                        <td className="text-right font-bold tabular-nums">
                          {result.points}
                        </td>
                        <td className="text-right font-bold tabular-nums">
                          {result.kills}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
