
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { supabaseService } from '@/lib/supabase/service';
import { fmt } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Confirmation({
  params,
}: {
  params: { code: string };
}) {
  if (!/^AGG-[0-9A-Fa-f]{20}$/.test(params.code)) notFound();

  const h = headers();
  const ip = (
    h.get('x-real-ip') ||
    h.get('x-forwarded-for') ||
    'unknown'
  ).split(',')[0].trim();

  const key =
    'lookup:' +
    createHash('sha256')
      .update(ip + (process.env.RATE_LIMIT_SALT ?? ''))
      .digest('hex')
      .slice(0, 32);

  const sb = supabaseService();

  const { data: allowed, error: limitError } = await sb.rpc(
    'check_rate_limit',
    {
      p_key: key,
      p_limit: 20,
      p_window: 600,
    }
  );

  if (limitError || !allowed) notFound();

  const { data } = await sb.rpc('get_registration_public', {
    p_code: params.code,
  });

  const r = data?.[0];

  if (!r) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b18] px-4 py-12 text-white sm:py-16">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-blue-600/10 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">

        {/* SUCCESS HEADER */}
        <section className="mb-8 text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-4xl text-emerald-300 shadow-lg shadow-emerald-500/15 animate-[fadeInUp_.5s_ease-out]">
            ✓
          </div>

          <p className="mb-3 text-xs font-black tracking-[0.3em] text-cyan-300">
            ARENAGG REGISTRATION
          </p>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Registration received
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your team registration has been submitted successfully.
            Save your registration ID for future reference.
          </p>

        </section>

        {/* MAIN CARD */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#101e36]/95 via-[#0b162a]/95 to-[#080f1e]/95 p-5 shadow-2xl shadow-blue-950/40 backdrop-blur-xl sm:p-8 animate-[fadeInUp_.65s_ease-out]">

          {/* CARD GLOW */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />

          {/* REGISTRATION ID */}
          <div className="relative rounded-2xl border border-cyan-300/25 bg-[#061326]/90 p-5 text-center shadow-inner shadow-cyan-500/5 sm:p-7">

            <p className="text-xs font-black tracking-[0.25em] text-cyan-300">
              YOUR REGISTRATION ID
            </p>

            <div className="mt-4 break-all text-xl font-black tracking-wider text-white sm:text-3xl">
              {params.code.toUpperCase()}
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Keep this ID safe when contacting the organizer.
            </p>

          </div>

          {/* TEAM DETAILS */}
          <div className="relative mt-8">

            <div className="mb-5 flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40" />

              <h2 className="text-lg font-black text-white">
                Registration details
              </h2>
            </div>

            <dl className="grid gap-3">

              <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-sm text-slate-400">Team name</dt>
                <dd className="break-words text-sm font-bold text-white sm:text-right">
                  {r.team_name}
                </dd>
              </div>

              <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-sm text-slate-400">Tournament</dt>
                <dd className="break-words text-sm font-bold text-white sm:text-right">
                  {r.tournament_title} ({r.game_name})
                </dd>
              </div>

              <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-sm text-slate-400">Starting date</dt>
                <dd className="text-sm font-bold text-white sm:text-right">
                  {fmt(r.starts_at)}
                </dd>
              </div>

              <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-sm text-slate-400">Registration status</dt>
                <dd>
                  <span
                    className={`st ${
                      r.status === 'approved'
                        ? 'ok'
                        : r.status === 'rejected'
                        ? 'bad'
                        : 'wait'
                    }`}
                  >
                    {r.status === 'pending'
                      ? 'Pending approval'
                      : r.status}
                  </span>
                </dd>
              </div>

            </dl>

          </div>

          {/* ACTION */}
          <div className="relative mt-8">
            <Link
              href="/"
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/25"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Back to tournaments
            </Link>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="mt-8 text-center text-xs leading-6 text-slate-500">
          © {new Date().getFullYear()} ARENAGG
          <span className="mx-2 text-cyan-400">•</span>
          Community esports. Not affiliated with game publishers.
        </footer>

      </div>
    </main>
  );
}
