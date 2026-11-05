
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginForm({ denied }: { denied: boolean }) {
  const r = useRouter();

  const [err, setErr] = useState(
    denied ? 'This account is not an administrator.' : ''
  );

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (denied) {
      supabaseBrowser().auth.signOut();
    }
  }, [denied]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setErr('');

    const f = new FormData(e.currentTarget);

    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');

    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErr('Invalid email or password.');
        return;
      }

      r.replace('/admin');
      r.refresh();
    } catch {
      setErr('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="card relative w-full overflow-hidden border border-cyan-400/20 bg-slate-950/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.12)] backdrop-blur-2xl sm:p-9"
    >

      {/* TOP ACCENT */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />

      {/* BRAND */}
      <div className="mb-8 flex flex-col items-center text-center">

        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.08] shadow-[0_0_30px_rgba(6,182,212,0.12)]">
          <span className="text-2xl font-black tracking-tight text-white">
            A<span className="text-cyan-400">G</span>
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          ARENA<span className="text-cyan-400">GG</span>
        </h1>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Administrator Portal
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Private Access
          </span>
        </div>

      </div>

      {/* LOGIN HEADING */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">
          Welcome back
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Sign in to manage your tournaments.
        </p>
      </div>

      {/* EMAIL */}
      <div className="mb-5">
        <label
          htmlFor="admin-email"
          className="mb-2 block text-sm font-semibold text-slate-300"
        >
          Email address
        </label>

        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="admin@example.com"
          className="input w-full min-w-0 border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 transition-all duration-300 hover:border-cyan-400/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-6">
        <label
          htmlFor="admin-password"
          className="mb-2 block text-sm font-semibold text-slate-300"
        >
          Password
        </label>

        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          className="input w-full min-w-0 border border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 transition-all duration-300 hover:border-cyan-400/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {/* ERROR */}
      {err && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
        >
          {err}
        </div>
      )}

      {/* SIGN IN */}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Signing in...' : 'Sign in to dashboard'}
      </button>

      {/* FOOTER */}
      <div className="mt-7 border-t border-white/10 pt-5 text-center">
        <p className="text-xs text-slate-500">
          Protected administrator access
        </p>

        <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-slate-600">
          ARENAGG © 2026
        </p>
      </div>

    </form>
  );
}
