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
export default async function Results() {
  const { data } = await supabaseServer().from('results_public').select('*').order('placement');
  const groups = new Map<string, { title: string; game: string; slug: string; rows: any[] }>();
  (data ?? []).forEach((r) => { if (!groups.has(r.tournament_id)) groups.set(r.tournament_id, { title: r.title, game: r.game_name, slug: r.game_slug, rows: [] }); groups.get(r.tournament_id)!.rows.push(r); });
  return (<main className="wrap py-10"><div className="text-xs font-bold tracking-widest text-accd">PUBLISHED</div><h1 className="mb-6 mt-1 text-4xl">Results</h1>
    <div className="grid gap-5">{[...groups.entries()].map(([id, g]) => (<section key={id} className="card"><div className="text-xs font-bold tracking-wider" style={{ color: gameColor(g.slug) }}>{g.game.toUpperCase()}</div><h2 className="mb-2 text-xl">{g.title}</h2>
      <div className="overflow-x-auto"><table><thead><tr><th>Place</th><th>Team</th><th>Points</th><th>Kills</th></tr></thead><tbody>{g.rows.map((r) => <tr key={r.team_name}><td><b>#{r.placement}</b></td><td>{r.team_name}</td><td>{r.points}</td><td>{r.kills}</td></tr>)}</tbody></table></div></section>))}
      {!groups.size && <div className="card text-center text-muted">No results have been published yet.</div>}</div></main>);
}
