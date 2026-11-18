import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import RegisterForm from '@/components/RegisterForm';
import { fmt, gameColor, slotInfo, type PublicTournament } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tournament Registration',
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  params,
}: {
  params: { id: string };
}) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      params.id
    )
  ) {
    notFound();
  }

  const { data } = await supabaseServer()
    .from('tournament_public')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) notFound();

  const t = data as PublicTournament;
  const s = slotInfo(t);

  return (
    <main className="wrap py-10">
      <div className="mx-auto w-full max-w-3xl">

        {/* TOURNAMENT HEADER */}
        <header className="rise mb-8 flex w-full flex-col items-center text-center">
          <Link href={`/tournaments/${t.id}`} className="mb-5 inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200">← Tournament details</Link>

          <div
            className="text-xs font-bold tracking-[0.2em]"
            style={{ color: gameColor(t.game_slug) }}
          >
            {t.game_name.toUpperCase()} · REGISTRATION
          </div>

          <h1 className="mt-3 w-full break-words text-center text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>

          <p className="mt-3 text-center text-sm text-muted sm:text-base">
            {fmt(t.starts_at)} · {s.label} ·{' '}
            {t.entry_fee > 0 ? `Entry ₹${t.entry_fee}` : 'Free entry'}
          </p>
          <div className="mt-5 grid w-full max-w-xl grid-cols-3 gap-2 rounded-2xl border border-cyan-300/15 bg-white/[0.025] p-3 text-center sm:gap-4 sm:p-4">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Format</p><p className="mt-1 text-xs font-extrabold text-white sm:text-sm">{t.team_size === 1 ? 'Solo' : `${t.team_size} players`}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entry</p><p className="mt-1 text-xs font-extrabold text-white sm:text-sm">{t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Slots</p><p className="mt-1 text-xs font-extrabold text-white sm:text-sm">{Math.max(0, t.max_teams - t.registered)} left</p></div>
          </div>

        </header>

        {/* REGISTRATION FORM */}
        {s.canRegister ? (
          <div className="w-full">
            <RegisterForm
              tournament={{
                id: t.id,
                title: t.title,
                team_size: t.team_size,
                entry_fee: t.entry_fee,
              }}
            />

            {/* WHAT HAPPENS NEXT */}
            <aside
              className="card rise mt-6 w-full"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              <h3 className="text-lg font-bold">
                What happens next
              </h3>

              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
                <li>You receive a unique registration ID.</li>
                <li>The organizer reviews and approves your team.</li>
                <li>Match details are shared on the tournament page.</li>
              </ol>
            </aside>
          </div>
        ) : (
          <div className="card mx-auto w-full text-center">
            <b>{s.label}.</b>{' '}
            <Link
              className="text-accd underline"
              href={`/tournaments/${t.id}`}
            >
              Back to tournament
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
