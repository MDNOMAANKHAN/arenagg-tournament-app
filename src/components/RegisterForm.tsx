
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
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setFields({});

    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '').trim();

    const sn = g('sn');
    const sg = g('sg');

    const body = {
      tournament_id: t.id,
      team_name: g('team_name'),
      captain_name: g('captain_name'),
      captain_game_id: g('captain_game_id'),
      captain_contact: g('captain_contact'),

      teammates: Array.from(
        { length: t.team_size - 1 },
        (_, i) => ({
          name: g('tn' + i),
          game_id: g('tg' + i),
        })
      ),

      substitute: sn || sg ? { name: sn, game_id: sg } : null,

      website: g('website'),
      t: loaded.current,
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const j = await res.json().catch(() => ({}));

      if (res.ok && typeof j.code === 'string') {
        r.push('/registration/' + j.code);
        return;
      }

      setErr(j.error || 'Something went wrong.');
      setFields(j.fields || {});
    } catch {
      setErr('Network error. Please try again.');
    }

    setBusy(false);
  }

  const I = (n: string, label: string, ph = '') => (
    <div>
      <label className="l" htmlFor={n}>{label}</label>
      <input
        id={n}
        name={n}
        className="input"
        placeholder={ph}
        autoComplete="off"
        maxLength={
          n.includes('game_id') || n.startsWith('tg') ? 40 : 60
        }
        required
      />
    </div>
  );

  return (
    <form
      onSubmit={submit}
      className="card rise grid gap-6"
      style={{ '--i': 1 } as React.CSSProperties}
    >
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* TEAM & CAPTAIN */}
      <div>
        <div className="mb-3 text-sm font-extrabold">
          1 · Team &amp; captain
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {I('team_name', 'Team name', 'Night Wolves')}
          {I('captain_name', 'Captain name')}
          {I('captain_game_id', 'Captain gaming ID', 'Player#1234')}
          {I('captain_contact', 'Captain phone or email', '+91 98xxxxxxxx')}
        </div>
      </div>

      {/* TEAMMATES */}
      {t.team_size > 1 && (
        <div>
          <div className="mb-3 text-sm font-extrabold">
            2 · Teammates ({t.team_size - 1})
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {Array.from(
              { length: t.team_size - 1 },
              (_, i) => (
                <div key={i} className="contents">
                  {I('tn' + i, `Teammate ${i + 1} name`)}
                  {I('tg' + i, `Teammate ${i + 1} gaming ID`)}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* SUBSTITUTE */}
      <div>
        <div className="mb-3 text-sm font-extrabold">
          {t.team_size > 1 ? '3' : '2'} · Substitute{' '}
          <span className="font-medium text-muted">(optional)</span>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="l" htmlFor="sn">Substitute name</label>
            <input id="sn" name="sn" className="input" />
          </div>
          <div>
            <label className="l" htmlFor="sg">Substitute gaming ID</label>
            <input id="sg" name="sg" className="input" />
          </div>
        </div>
      </div>

      {/* UPI PAYMENT SCANNER */}
      <div className="rounded-xl border p-4">
        <div className="mb-3 text-sm font-extrabold">
          Payment · Scan & Pay
        </div>

        <UPIPayment
          amount={t.entry_fee ?? 100}
          tournamentName="ArenaGG Tournament"
          teamName="Your Team"
        />

        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          <b>Waiting for admin approval</b>
          <p className="mt-2">
            Complete your payment using the UPI scanner.
            Your team will be confirmed after the administrator
            verifies your payment.
          </p>
        </div>
      </div>

      {/* ERRORS */}
      {err && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-3.5 text-sm text-red-800"
        >
          <b>{err}</b>
          {Object.entries(fields).map(([k, v]) => (
            <div key={k} className="mt-1 text-xs">
              {k.replace(/_/g, ' ')}: {v.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT */}
      <button className="btn w-full !py-4" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit registration →'}
      </button>
    </form>
  );
}
