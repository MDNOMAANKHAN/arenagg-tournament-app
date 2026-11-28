import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { gameColor } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Esports Tournament Results, Rankings & Standings',
  description:
    'See published online esports tournament results, team rankings, placements, points and kills from ARENAGG Free Fire MAX, BGMI and Valorant competitions.',
  keywords: ['online esports tournament results', 'Free Fire MAX tournament results', 'BGMI tournament rankings', 'Valorant tournament results', 'esports standings India', 'team placements and rankings'],
  alternates: { canonical: '/results' },
  openGraph: {
    type: 'website',
    title: 'Esports Results & Rankings | ARENAGG',
    description:
      'View published placements, team rankings and results from ARENAGG community esports tournaments.',
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
  const sb = await supabaseServer();
  const { data: completed, error: completedError } = await sb
    .from('tournament_public')
    .select('id')
    .eq('status', 'completed');

  let data: PublicResult[] = [];
  let error = completedError;
  const completedIds = (completed ?? []).map((t) => t.id);

  if (!error && completedIds.length > 0) {
    const resultQuery = await sb
      .from('results_public')
      .select('*')
      .in('tournament_id', completedIds)
      .order('placement');
    data = (resultQuery.data ?? []) as PublicResult[];
    error = resultQuery.error;
  }

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
    <main className="wrap py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-xs font-bold tracking-[0.2em] text-accd">
          OFFICIAL STANDINGS
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Tournament Results
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Published placements, points and kills from ARENAGG community
          competitions.
        </p>
      </header>

      {error ? (
        <section
          className="card border border-amber-400/20 text-center"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-lg font-bold">Results are temporarily unavailable</h2>
          <p className="mt-2 text-sm text-muted">
            Please try again in a little while.
          </p>
        </section>
      ) : groups.size === 0 ? (
        <section className="card py-12 text-center">
          <div className="text-3xl" aria-hidden="true">🏆</div>
          <h2 className="mt-3 text-lg font-bold">No results published yet</h2>
          <p className="mt-2 text-sm text-muted">
            Completed tournament standings will appear here after they are
            published by the organizer.
          </p>
        </section>
      ) : (
        <div className="grid gap-5">
          {[...groups.entries()].map(([id, tournament]) => (
            <section
              key={id}
              className="card min-w-0 overflow-hidden p-0"
              aria-labelledby={`results-${id}`}
            >
              <div className="border-b border-white/10 p-5 sm:p-6">
                <div
                  className="text-[11px] font-black tracking-[0.18em]"
                  style={{ color: gameColor(tournament.slug) }}
                >
                  {tournament.game.toUpperCase()}
                </div>
                <h2
                  id={`results-${id}`}
                  className="mt-2 break-words text-xl font-black sm:text-2xl"
                >
                  {tournament.title}
                </h2>
                <p className="mt-1 text-xs text-muted">
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
    </main>
  );
}
