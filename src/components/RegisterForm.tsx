
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import UPIPayment from './UPIPayment';

export default function RegisterForm({
  tournament: t,
}: {
  tournament: {
    id: string;
    team_size: number;
    entry_fee?: number;
  };
}) {
  const r = useRouter();
  const loaded = useRef(Date.now());

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const g = (n: string) => String(fd.get(n) || '').trim();

    const teammates = Array.from(
      { length: Math.max(0, t.team_size - 1) },
      (_, i) => ({
        name: g(`tn${i}`),
        game_id: g(`tg${i}`),
      })
    );

    const substituteName = g('sn');
    const substituteGameId = g('sg');

    const body = {
      tournament_id: t.id,
      team_name: g('team_name'),
      captain_name: g('captain_name'),
      captain_game_id: g('captain_game_id'),
      captain_contact: g('captain_contact'),
      teammates,
      substitute:
        substituteName || substituteGameId
          ? {
              name: substituteName,
              game_id: substituteGameId,
            }
          : null,
      website: g('website'),
      t: loaded.current,
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(
          data?.fields
            ? Object.entries(data.fields)
                .map(([field, messages]) =>
                  `${field}: ${(messages as string[]).join(', ')}`
                )
                .join(' | ')
            : data?.error || 'Registration failed'
        );
        return;
      }

      r.push(`/registration/${data.code}`);
      r.refresh();
    } catch {
      setErr('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const I = (
    n: string,
    label: string,
    ph = '',
    required = true
  ) => (
    <div className="w-full min-w-0">
      <label className="l mb-2 block" htmlFor={n}>
        {label}
      </label>

      <input
        id={n}
        name={n}
        className="input w-full min-w-0 transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        placeholder={ph}
        autoComplete="off"
        maxLength={100}
        required={required}
      />
    </div>
  );

  return (
    <div className="relative mx-auto flex w-full min-w-0 items-center justify-center">

      <form
        onSubmit={submit}
        className="card rise grid w-full min-w-0 max-w-none gap-6 overflow-hidden border border-cyan-400/25 bg-slate-950/95 p-5 shadow-[0_0_55px_rgba(6,182,212,0.12)] backdrop-blur-xl sm:gap-8 sm:p-8 lg:p-10"
      >

        {/* SPAM PROTECTION */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        {/* CENTRED INTRODUCTION */}
        <div className="flex flex-col items-center justify-center border-b border-white/10 pb-6 text-center">

          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              ArenaGG Competition
            </span>
          </div>

          <h2 className="w-full text-center text-2xl font-black tracking-tight text-white sm:text-3xl">
            Tournament <span className="text-cyan-400">Registration</span>
          </h2>

          <p className="mt-2 text-center text-sm leading-6 text-slate-400">
            Enter your squad details and get ready to compete.
          </p>

        </div>

        {/* TEAM AND CAPTAIN */}
        <section className="grid min-w-0 gap-4">

          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <span className="h-7 w-1 rounded-full bg-cyan-400" />
            Team & Captain
          </h2>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {I('team_name', 'Team Name', 'Enter your team name')}
            {I('captain_name', 'Captain Name', 'Full name')}
            {I('captain_game_id', 'Captain Gaming ID', 'Your game ID')}
            {I('captain_contact', 'Captain Phone Number', 'Contact number')}
          </div>

        </section>

        {/* TEAMMATES */}
        {t.team_size > 1 && (
          <section className="grid min-w-0 gap-4">

            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-7 w-1 rounded-full bg-violet-400" />
              Teammates
            </h2>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: t.team_size - 1 }, (_, i) => (
                <div
                  key={i}
                  className="group grid min-w-0 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-violet-400/[0.06] hover:shadow-[0_0_25px_rgba(167,139,250,0.08)]"
                >
                  <h3 className="font-semibold text-violet-300">
                    Player {i + 2}
                  </h3>

                  {I(`tn${i}`, `Player ${i + 2} Name`, 'Full name')}
                  {I(`tg${i}`, `Player ${i + 2} Gaming ID`, 'Gaming ID')}
                </div>
              ))}
            </div>

          </section>
        )}

        {/* SUBSTITUTE */}
        <section className="grid min-w-0 gap-4">

          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <span className="h-7 w-1 rounded-full bg-fuchsia-400" />
            Substitute Player (Optional)
          </h2>

          <div className="grid min-w-0 grid-cols-1 gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition duration-300 hover:border-fuchsia-400/20 sm:grid-cols-2">
            {I('sn', 'Substitute Name', 'Full name', false)}
            {I('sg', 'Substitute Gaming ID', 'Gaming ID', false)}
          </div>

        </section>

        {/* PAYMENT */}
        <section className="grid min-w-0 gap-4 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.07] to-blue-500/[0.03] p-4 shadow-[0_0_25px_rgba(6,182,212,0.04)] sm:p-5">

          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <span className="h-7 w-1 rounded-full bg-emerald-400" />
            Entry Fee Payment
          </h2>

          <UPIPayment
            amount={t.entry_fee ?? 100}
            tournamentName="ArenaGG Tournament"
            teamName="Your Team"
          />

          <p className="text-sm leading-6 text-blue-300">
            After submitting your registration, your entry will remain pending
            until the admin verifies your payment and approves your team.
          </p>

        </section>

        {/* ERROR */}
        {err && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {err}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={busy}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative z-10">
            {busy ? 'Submitting Registration...' : 'Submit Registration'}
          </span>
        </button>

      </form>
    </div>
  );
}
