
import Link from 'next/link';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';

const TONE: Record<string, string> = {
  draft: 'gray',
  open: 'ok',
  closed: 'wait',
  live: 'info',
  completed: 'gray',
};

export default async function Dashboard() {
  const a = (await getAdmin())!;

  const { data } = await a.sb
    .from('tournaments')
    .select(
      'id,title,status,starts_at,max_teams,games(name),registrations(status)'
    )
    .order('starts_at', { ascending: false });

  const rows = (data ?? []).map((t: any) => {
    const registrations = t.registrations ?? [];

    return {
      ...t,
      active: registrations.filter(
        (r: any) => r.status !== 'rejected'
      ).length,
      pending: registrations.filter(
        (r: any) => r.status === 'pending'
      ).length,
    };
  });

  const totalTeams = rows.reduce(
    (n: number, t: any) => n + t.active,
    0
  );

  const totalPending = rows.reduce(
    (n: number, t: any) => n + t.pending,
    0
  );

  const liveCount = rows.filter(
    (t: any) => t.status === 'live'
  ).length;

  const stats = [
    {
      title: 'TOURNAMENTS',
      value: rows.length,
      description: 'Total competitions',
      icon: '🏆',
      color: 'cyan',
    },
    {
      title: 'REGISTERED TEAMS',
      value: totalTeams,
      description: 'Active registrations',
      icon: '👥',
      color: 'purple',
    },
    {
      title: 'PENDING APPROVAL',
      value: totalPending,
      description: 'Awaiting review',
      icon: '⏳',
      color: 'amber',
    },
    {
      title: 'LIVE TOURNAMENTS',
      value: liveCount,
      description: 'Currently running',
      icon: '🎮',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* PAGE HEADER */}
      <section className="animate-[fadeInUp_.5s_ease-out]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold tracking-widest text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              ADMIN OVERVIEW
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Welcome to your{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Arena.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
              Your tournaments, your players, your competition.
              Everything managed from one place.
            </p>
          </div>

          <Link
            href="/admin/tournaments/new"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-bold text-white shadow-lg shadow-cyan-500/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/25"
          >
            <span className="text-xl transition-transform duration-300 group-hover:rotate-90">
              +
            </span>
            Create Tournament
          </Link>

        </div>
      </section>

      {/* HERO PANEL */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101c35] via-[#0b1425] to-[#090e1b] p-6 sm:p-8">

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-[90px]" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

          <div>
            <div className="text-xs font-black tracking-[0.25em] text-cyan-300">
              COMPETITIVE GAMING MANAGEMENT
            </div>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Build. Compete. Conquer.
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-white/45">
              Manage your gaming tournaments and keep your community
              moving forward.
            </p>
          </div>

          <div className="hidden select-none text-7xl opacity-80 sm:block">
            🎮
          </div>

        </div>

      </section>

      {/* STATISTICS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Platform Overview</h2>
          <span className="text-xs text-white/35">Live database totals</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"
              style={{
                animation: 'fadeInUp .55s ease-out both',
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition duration-500 group-hover:opacity-100 ${
                  stat.color === 'cyan'
                    ? 'bg-cyan-400/10'
                    : stat.color === 'purple'
                    ? 'bg-purple-400/10'
                    : stat.color === 'amber'
                    ? 'bg-amber-400/10'
                    : 'bg-emerald-400/10'
                }`}
              />

              <div className="relative flex items-center justify-between">
                <span className="text-[11px] font-black tracking-widest text-white/40">
                  {stat.title}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg transition duration-300 group-hover:scale-110">
                  {stat.icon}
                </span>
              </div>

              <div className="relative mt-5 text-4xl font-black tracking-tight">
                {stat.value}
              </div>

              <p className="relative mt-2 text-xs text-white/40">
                {stat.description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* TOURNAMENTS */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

        <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:p-6">

          <div>
            <div className="text-[10px] font-black tracking-[0.25em] text-cyan-400">
              MANAGEMENT CENTER
            </div>

            <h2 className="mt-2 text-xl font-black sm:text-2xl">
              Your Tournaments
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Manage competitions, registrations and results.
            </p>
          </div>

          <span className="w-fit rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/50">
            {rows.length} TOTAL
          </span>

        </div>

        <div className="grid gap-4 p-4 sm:p-6">

          {rows.map((t: any, index: number) => {
            const percentage =
              t.max_teams > 0
                ? Math.min(
                    100,
                    Math.round((t.active / t.max_teams) * 100)
                  )
                : 0;

            return (
              <article
                key={t.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0b1424]/80 p-5 transition duration-300 hover:border-cyan-400/25 hover:bg-[#101b30]"
                style={{
                  animation: 'fadeInUp .5s ease-out both',
                  animationDelay: `${Math.min(index * 70, 500)}ms`,
                }}
              >

                {/* HOVER ACCENT */}
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-cyan-400 to-blue-500 opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="flex flex-col gap-6 xl:flex-row xl:items-center">

                  {/* TOURNAMENT DETAILS */}
                  <div className="min-w-0 flex-1">

                    <div className="mb-3 flex flex-wrap items-center gap-2">

                      <span className={`st ${TONE[t.status] || 'gray'}`}>
                        {t.status}
                      </span>

                      {t.pending > 0 && (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                          {t.pending} pending
                        </span>
                      )}

                    </div>

                    <h3 className="break-words text-lg font-black transition duration-300 group-hover:text-cyan-300 sm:text-xl">
                      {t.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45 sm:text-sm">
                      <span>🎮 {t.games?.name || 'Gaming Tournament'}</span>
                      <span>📅 {fmt(t.starts_at)}</span>
                    </div>

                    {/* REGISTRATION PROGRESS */}
                    <div className="mt-5 max-w-lg">

                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-white/40">Team capacity</span>
                        <span className="font-bold text-white/70">
                          {t.active} / {t.max_teams}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                    </div>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[420px] xl:shrink-0">

                    <Link
                      href={`/admin/tournaments/${t.id}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/admin/tournaments/${t.id}/registrations`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-3 text-xs font-bold text-amber-300 transition hover:bg-amber-400/10"
                    >
                      Registrations{t.pending > 0 ? ` (${t.pending})` : ''}
                    </Link>

                    <Link
                      href={`/admin/tournaments/${t.id}/manage`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-purple-400/20 bg-purple-400/[0.04] px-3 text-xs font-bold text-purple-300 transition hover:bg-purple-400/10"
                    >
                      Matches
                    </Link>

                  </div>

                </div>

              </article>
            );
          })}

          {/* EMPTY STATE */}
          {!rows.length && (
            <div className="rounded-2xl border border-dashed border-white/15 px-5 py-16 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-4xl">
                🏆
              </div>

              <h3 className="mt-5 text-xl font-black">
                Your arena starts here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Create your first tournament and start building
                your competitive gaming community.
              </p>

              <Link
                href="/admin/tournaments/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                + Create First Tournament
              </Link>

            </div>
          )}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold tracking-widest text-white/20">
        <span>ARENAGG • CONTROL CENTER</span>
        <span>COMPETITIVE GAMING PLATFORM</span>
      </footer>

    </div>
  );
}
