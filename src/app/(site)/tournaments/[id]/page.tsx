
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import {
  fmt,
  gameColor,
  slotInfo,
  type PublicTournament,
} from '@/lib/format';

export const dynamic = 'force-dynamic';

type PublicTeam = {
  team_name: string;
  status: 'pending' | 'approved' | 'rejected';
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    return {
      title: 'Tournament not found',
      robots: { index: false, follow: false },
    };
  }

  const { data } = await supabaseServer()
    .from('tournament_public')
    .select('id,title,description,game_name,game_slug,starts_at,status')
    .eq('id', params.id)
    .maybeSingle();

  if (!data || data.status === 'draft' || data.status === 'cancelled') {
    return {
      title: 'Tournament not found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${data.title} – ${data.game_name} Tournament`;
  const description =
    data.description?.trim() ||
    `View ${data.title}, a ${data.game_name} community esports tournament on ARENAGG. Check the schedule, rules, team status and registration availability.`;
  const url = `/tournaments/${data.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'ARENAGG',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function TournamentPage({
  params,
}: {
  params: { id: string };
}) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    notFound();
  }

  const sb = supabaseServer();

  const { data, error } = await sb
    .from('tournament_public')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !data) notFound();

  const t = data as PublicTournament;
  const s = slotInfo(t);
  const c = gameColor(t.game_slug);

  const [
    { data: matches },
    { data: results },
    { data: teams, error: teamsError },
  ] = await Promise.all([
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

    sb
      .from('registration_teams_public')
      .select('team_name,status')
      .eq('tournament_id', t.id)
      .order('team_name'),
  ]);

  const publicTeams = (teams ?? []) as PublicTeam[];

  const approvedCount = publicTeams.filter(
    (team) => team.status === 'approved'
  ).length;

  const pendingCount = publicTeams.filter(
    (team) => team.status === 'pending'
  ).length;

  const rejectedCount = publicTeams.filter(
    (team) => team.status === 'rejected'
  ).length;

  const activeCount = approvedCount + pendingCount;

  const progress =
    t.max_teams > 0
      ? Math.min(100, Math.round((activeCount / t.max_teams) * 100))
      : 0;

  return (
    <main className="min-h-screen w-full py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">

        {/* MAIN CONTENT */}
        <div className="min-w-0 space-y-7">

          {/* TOURNAMENT HEADER */}
          <section
            className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-[#101e36]/95 via-[#0b1426]/95 to-[#080e1c]/95 p-6 shadow-xl shadow-blue-950/20 sm:p-8"
            style={{ animation: 'fadeInUp .55s ease-out both' }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-[85px]"
              style={{ backgroundColor: `${c}22` }}
            />

            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full border px-3 py-1.5 text-[11px] font-black tracking-widest"
                  style={{
                    color: c,
                    borderColor: `${c}55`,
                    backgroundColor: `${c}15`,
                  }}
                >
                  {t.game_name.toUpperCase()}
                </span>

                <span className="st info">
                  {t.status.toUpperCase()}
                </span>
              </div>

              <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-5xl">
                {t.title}
              </h1>

              {t.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  {t.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-400 sm:text-sm">
                <span>📅 {fmt(t.starts_at)}</span>
                <span>
                  👥 {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}
                </span>
                <span>🏆 {activeCount} active teams</span>
              </div>
            </div>
          </section>

          {/* TEAM STATUS */}
          <section
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#101a2d]/95 to-[#080f1d]/95 p-5 shadow-xl shadow-black/20 sm:p-7"
            style={{ animation: 'fadeInUp .65s ease-out both' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black tracking-[0.25em] text-cyan-400">
                  COMPETITION OVERVIEW
                </div>
                <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  Registered Teams
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  See which teams have been accepted.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-center">
                <div className="text-2xl font-black text-cyan-300">
                  {activeCount}/{t.max_teams}
                </div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400">
                  ACTIVE TEAMS
                </div>
              </div>
            </div>

            {/* STATUS CARDS */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'APPROVED',
                  value: approvedCount,
                  color: 'text-emerald-400',
                  border: 'border-emerald-400/20',
                  bg: 'bg-emerald-400/[0.06]',
                  glow: 'bg-emerald-400/10',
                  icon: '✓',
                },
                {
                  label: 'PENDING',
                  value: pendingCount,
                  color: 'text-amber-400',
                  border: 'border-amber-400/20',
                  bg: 'bg-amber-400/[0.06]',
                  glow: 'bg-amber-400/10',
                  icon: '◷',
                },
                {
                  label: 'REJECTED',
                  value: rejectedCount,
                  color: 'text-red-400',
                  border: 'border-red-400/20',
                  bg: 'bg-red-400/[0.06]',
                  glow: 'bg-red-400/10',
                  icon: '×',
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`relative overflow-hidden rounded-xl border ${item.border} ${item.bg} p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  style={{
                    animation: 'fadeInUp .55s ease-out both',
                    animationDelay: `${150 + index * 100}ms`,
                  }}
                >
                  <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${item.glow}`} />

                  <div className="relative flex items-center justify-between">
                    <span className={`text-3xl font-black ${item.color}`}>
                      {item.value}
                    </span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${item.border} text-lg ${item.color}`}>
                      {item.icon}
                    </span>
                  </div>

                  <p className="relative mt-3 text-[10px] font-black tracking-[0.17em] text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CAPACITY PROGRESS */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span className="text-slate-400">Tournament capacity</span>
                <span className="text-cyan-300">{progress}%</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* TEAM LIST */}
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-white">
                  Participating Teams
                </h3>
                <span className="text-xs text-slate-500">
                  {publicTeams.length} applications
                </span>
              </div>

              {teamsError ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300">
                  Team status is temporarily unavailable.
                </div>
              ) : publicTeams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 p-9 text-center">
                  <div className="text-4xl">🏆</div>
                  <p className="mt-3 font-bold text-white">
                    Be the first to compete!
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    No teams have registered yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publicTeams.map((team, index) => (
                    <div
                      key={`${team.team_name}-${index}`}
                      className="group flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080f1d]/80 p-4 transition duration-300 hover:translate-x-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.035]"
                      style={{
                        animation: 'fadeInUp .45s ease-out both',
                        animationDelay: `${200 + index * 65}ms`,
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-black text-cyan-300">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="break-words font-bold text-slate-200 transition-colors group-hover:text-cyan-200">
                          {team.team_name}
                        </span>
                      </div>

                      {team.status === 'approved' ? (
                        <span className="st ok">✓ Approved</span>
                      ) : team.status === 'pending' ? (
                        <span className="st wait">◷ Pending</span>
                      ) : (
                        <span className="st gray">Rejected</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-5 border-t border-white/[0.07] pt-4 text-[11px] leading-5 text-slate-500">
              Public information is limited to team names and approval statuses.
              Player details and registration codes remain private.
            </p>
          </section>

          {/* RULES */}
          <section
            className="rounded-2xl border border-white/10 bg-[#0b1425]/90 p-5 sm:p-7"
            style={{ animation: 'fadeInUp .7s ease-out both' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-xl">
                📜
              </span>
              <div>
                <h2 className="text-xl font-black text-white">
                  Tournament Rules
                </h2>
                <p className="text-xs text-slate-500">
                  Read before registering.
                </p>
              </div>
            </div>

            <div className="break-words rounded-xl border border-white/10 bg-[#070e1a]/70 p-4 text-sm leading-7 text-slate-300 whitespace-pre-wrap sm:p-5" aria-label="Tournament rules">
              {t.rules || 'Rules will be announced by the organizer.'}
            </div>
          </section>

          {/* MATCHES */}
          {!!matches?.length && (
            <section className="card min-w-0">
              <h2 className="mb-4 text-xl font-black">Matches</h2>
              <div className="overflow-x-auto" role="region" aria-label="Tournament matches table" tabIndex={0}>
                <table className="w-full min-w-[480px]">
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
                        <td><span className="st gray">{m.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* RESULTS */}
          {!!results?.length && (
            <section className="card min-w-0">
              <h2 className="mb-4 text-xl font-black">Results</h2>
              <div className="overflow-x-auto" role="region" aria-label="Tournament results table" tabIndex={0}>
                <table className="w-full min-w-[480px]">
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

        {/* RIGHT SIDEBAR */}
        <aside
          className="h-fit space-y-5 lg:sticky lg:top-6"
          style={{ animation: 'fadeInUp .65s ease-out both' }}
        >
          <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#101e36] to-[#080f1d] p-5 shadow-xl shadow-blue-950/20 sm:p-6">
            <div className="mb-5 text-xs font-black tracking-[0.2em] text-cyan-300">
              TOURNAMENT INFORMATION
            </div>

            <dl className="space-y-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">Starts</dt>
                <dd className="text-right font-bold text-white">
                  {fmt(t.starts_at)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">Format</dt>
                <dd className="font-bold text-white">
                  {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">Entry fee</dt>
                <dd className="font-bold text-emerald-400">
                  {t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">Active teams</dt>
                <dd className="font-bold text-white">
                  {activeCount} / {t.max_teams}
                </dd>
              </div>
            </dl>

            <div className="my-6 h-px bg-white/10" />

            {s.canRegister ? (
              <Link
                href={`/register/${t.id}`}
                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/25"
              >
                Register your team
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <div className="st gray w-full py-3 text-center">
                {s.label}
              </div>
            )}

            <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">
              Join the competition. Play fair. Rise together.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0b1425]/90 p-5">
            <div className="text-xs font-black tracking-widest text-slate-400">
              TOURNAMENT STATUS
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-bold text-white">
                {t.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Check this page for tournament updates and team approvals.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
