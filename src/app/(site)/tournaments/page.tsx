
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import {
  fmt,
  gameColor,
  slotInfo,
  type PublicTournament,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function TournamentPage({
  params,
}: {
  params: { id: string };
}) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    notFound();
  }

  const sb = supabaseServer();

  const { data } = await sb
    .from('tournament_public')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) notFound();

  const t = data as PublicTournament;
  const s = slotInfo(t);
  const c = gameColor(t.game_slug);

  const [{ data: matches }, { data: results }] = await Promise.all([
    sb
      .from('matches')
      .select('id,round_label,match_no,scheduled_at,status')
      .eq('tournament_id', t.id)
      .order('match_no'),

    sb
      .from('results_public')
      .select('team_name,placement,points,kills')
      .eq('tournament_id', t.id)
      .order('placement'),
  ]);

  return (
    <main className="wrap grid min-w-0 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid min-w-0 content-start gap-6">
        <div className="rise">
          <div
            className="text-xs font-bold tracking-widest"
            style={{ color: c }}
          >
            {t.game_name.toUpperCase()}
          </div>

          <h1 className="mt-1 text-4xl">{t.title}</h1>

          {t.description && (
            <p className="mt-2 text-muted">{t.description}</p>
          )}
        </div>

        <section className="card">
          <h2 className="mb-2 text-xl">Rules</h2>
          <div className="whitespace-pre-wrap text-sm leading-7">
            {t.rules || 'Rules will be announced by the organizer.'}
          </div>
        </section>

        {!!matches?.length && (
          <section className="card min-w-0">
            <h2 className="mb-2 text-xl">Matches</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Round</th>
                    <th>When</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id}>
                      <td>{m.match_no}</td>
                      <td><b>{m.round_label}</b></td>
                      <td>{m.scheduled_at ? fmt(m.scheduled_at) : 'TBA'}</td>
                      <td>
                        <span className="st gray">{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!!results?.length && (
          <section className="card min-w-0">
            <h2 className="mb-2 text-xl">Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Team</th>
                    <th>Points</th>
                    <th>Kills</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.team_name}>
                      <td><b>#{r.placement}</b></td>
                      <td>{r.team_name}</td>
                      <td>{r.points}</td>
                      <td>{r.kills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <aside
        className="card rise h-fit"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Starts</dt>
            <dd className="font-bold">{fmt(t.starts_at)}</dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-muted">Format</dt>
            <dd className="font-bold">
              {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}
            </dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-muted">Entry</dt>
            <dd className="font-bold">Free</dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-muted">Teams</dt>
            <dd className="font-bold">
              {t.registered} / {t.max_teams}
            </dd>
          </div>
        </dl>

        <div className="bar my-4">
          <i style={{ width: `${s.pct}%` }} />
        </div>

        {s.canRegister ? (
          <Link href={`/register/${t.id}`} className="btn w-full">
            Register free →
          </Link>
        ) : (
          <div className="st gray w-full text-center">{s.label}</div>
        )}
      </aside>
    </main>
  );
}
