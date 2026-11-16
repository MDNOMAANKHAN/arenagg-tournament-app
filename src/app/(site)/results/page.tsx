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
    <main className="arena-page relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-10 mt-4 sm:mb-12">
          <p className="text-xs font-black tracking-[0.3em] text-cyan-300">
            OFFICIAL STANDINGS
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Tournament Results
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Published placements, points and kills from ARENAGG community competitions.
          </p>
        </header>

        {error ? (
          <section
            className="arena-premium-card rounded-2xl border border-amber-400/20 p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <h2 className="text-lg font-bold text-white">Results are temporarily unavailable</h2>
            <p className="mt-2 text-sm text-slate-400">
              Please try again in a little while.
            </p>
          </section>
        ) : groups.size === 0 ? (
          <section className="arena-premium-card relative overflow-hidden rounded-2xl border border-blue-300/15 bg-[#0b1424]/80 px-5 py-16 text-center shadow-xl shadow-blue-950/20 backdrop-blur-xl">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[70px]" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-4xl shadow-lg shadow-cyan-500/10">
              🏆
            </div>
            <h2 className="relative mt-6 text-xl font-black text-white">
              No results published yet
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
              Completed tournament standings will appear here after they are published by the organizer.
            </p>
          </section>
        ) : (
          <div className="grid gap-6">
            {[...groups.entries()].map(([id, tournament]) => (
              <section
                key={id}
                className="arena-premium-card min-w-0 overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#101d35]/90 to-[#080f20]/90 shadow-lg shadow-blue-950/20 backdrop-blur-xl"
                aria-labelledby={`results-${id}`}
              >
                <div className="border-b border-blue-200/10 p-5 sm:p-6">
                  <div
                    className="text-xs font-black tracking-[0.18em]"
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
                  <p className="mt-2 text-xs text-slate-400">
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
                          <td className="max-w-[220px] break-words font-semibold text-white">
                            {result.team_name}
                          </td>
                          <td className="text-right font-bold tabular-nums text-slate-200">
                            {result.points}
                          </td>
                          <td className="text-right font-bold tabular-nums text-slate-200">
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
