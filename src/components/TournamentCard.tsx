
import Link from 'next/link';
import { fmt, gameColor, slotInfo, type PublicTournament } from '@/lib/format';

export default function TournamentCard({
  t,
  i,
}: {
  t: PublicTournament;
  i: number;
}) {
  const s = slotInfo(t);
  const c = gameColor(t.game_slug);

  const registered = t.registered ?? 0;
  const maxTeams = t.max_teams ?? 12;
  const isFull = registered >= maxTeams;

  return (
    <article
      className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#111e35]/95 via-[#0b1426]/95 to-[#080e1c]/95 p-5 shadow-xl shadow-blue-950/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/40 hover:shadow-2xl hover:shadow-blue-500/15 sm:p-6"
      style={{
        '--i': i,
        animation: 'fadeInUp .55s ease-out both',
        animationDelay: `${Math.min(i * 100, 600)}ms`,
      } as React.CSSProperties}
    >
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-[70px] transition-all duration-500 group-hover:bg-cyan-400/20" />

      {/* TOP ACCENT */}
      <div
        className="absolute left-0 top-0 h-1 w-full opacity-80 transition-all duration-500 group-hover:h-1.5"
        style={{ background: c }}
      />

      {/* GAME AND STATUS */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 pt-1">

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

        <span
          className={`st ${
            s.canRegister ? 'ok' : t.status === 'live' ? 'info' : 'gray'
          }`}
        >
          {s.label}
        </span>

      </div>

      {/* TOURNAMENT INFORMATION */}
      <div className="relative min-w-0">

        <h3 className="break-words text-xl font-black leading-snug text-white transition-colors duration-300 group-hover:text-cyan-200 sm:text-2xl">
          {t.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span>👥</span>
            {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}
          </span>

          <span className="text-white/20">•</span>

          <span className="inline-flex items-center gap-1.5">
            <span>📅</span>
            {fmt(t.starts_at)}
          </span>
        </div>

      </div>

      {/* REGISTRATION PROGRESS — ORIGINAL COUNT LOGIC PRESERVED */}
      <div className="relative rounded-xl border border-cyan-300/15 bg-[#050d1b]/75 p-4 shadow-inner shadow-black/20">

        <div className="mb-4 flex items-center justify-between gap-2">

          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400">
              TEAM REGISTRATION
            </p>

            <p className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
              <span className="text-cyan-300">{registered}</span>
              <span className="mx-1 text-white/35">/</span>
              <span>{maxTeams}</span>
              <span className="ml-1 text-xs font-semibold text-slate-400">
                teams
              </span>
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex rounded-lg border px-2.5 py-2 text-xs font-extrabold ${
                isFull
                  ? 'border-red-400/25 bg-red-400/10 text-red-300'
                  : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200'
              }`}
            >
              {isFull ? 'FULL' : `${maxTeams - registered} SLOTS LEFT`}
            </span>
          </div>

        </div>

        {/* PROGRESS BAR */}
        <div
          className="h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-white/10"
          role="progressbar"
          aria-label="Tournament team registration"
          aria-valuenow={registered}
          aria-valuemin={0}
          aria-valuemax={maxTeams}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.55)] transition-all duration-1000 ease-out"
            style={{ width: `${s.pct}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
          <span>Registration progress</span>
          <span className="text-cyan-300">{s.pct}%</span>
        </div>

      </div>

      {/* ACTION BUTTONS — ORIGINAL DESTINATIONS PRESERVED */}
      <div className="relative mt-auto grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">

        {s.canRegister && (
          <Link
            href={`/register/${t.id}`}
            className="btn flex min-h-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/25"
          >
            Register now →
          </Link>
        )}

        <Link
          href={`/tournaments/${t.id}`}
          className={`btn light flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-200 ${
            s.canRegister ? '' : 'sm:col-span-2'
          }`}
        >
          Details &amp; rules
        </Link>

      </div>

    </article>
  );
}
