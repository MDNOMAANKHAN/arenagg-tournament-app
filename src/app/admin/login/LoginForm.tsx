'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginForm({ denied }: { denied: boolean }) {
  const r = useRouter();
  const [err, setErr] = useState(denied ? 'This account is not an administrator.' : '');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerError = (message: string) => {
    setErr(message);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  useEffect(() => {
    if (denied) supabaseBrowser().auth.signOut();
  }, [denied]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr('');

    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');

    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
      if (error) {
        triggerError('Invalid email or password.');
        return;
      }
      r.replace('/admin');
      r.refresh();
    } catch {
      triggerError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={`admin-login-glass relative w-full overflow-hidden rounded-[28px] border p-6 sm:p-9 ${shake ? 'arena-error-shake' : ''}`}
    >
      <div className="admin-login-topline" aria-hidden="true" />
      <div className="relative z-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="admin-login-mark mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px]">
            <span className="text-2xl font-black tracking-tight text-white">A<span className="text-cyan-300">G</span></span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            ARENA<span className="text-cyan-300">GG</span>
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Administrator Portal
          </p>
          <div className="admin-login-access mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Private access</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your tournaments.</p>
        </div>

        <div className="mb-5">
          <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-200">
            Email address
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            spellCheck={false}
            placeholder="Enter your admin email"
            className="admin-login-input w-full min-w-0 rounded-xl border px-4 py-3.5 text-sm text-white outline-none transition"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-slate-200">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="admin-login-input w-full min-w-0 rounded-xl border py-3.5 pl-4 pr-14 text-sm text-white outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              title={showPassword ? 'Hide password' : 'Show password'}
              className="admin-password-eye absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                  <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.2 9.5 7-.4 1.1-1.2 2.4-2.4 3.5" />
                  <path d="M6.2 6.2C3.9 7.6 2.8 9.5 2.5 12c.9 2.8 4.5 7 9.5 7 1.1 0 2.1-.2 3-.6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="2.7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {err && (
          <div role="alert" className="arena-toast-drop mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="admin-login-submit group relative w-full overflow-hidden rounded-xl px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative z-10 inline-flex items-center justify-center gap-2">
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
            {busy ? 'Signing in...' : 'Sign in to dashboard'}
          </span>
        </button>

        <div className="mt-7 border-t border-white/10 pt-5 text-center">
          <p className="text-xs text-slate-400">Protected administrator access</p>
          <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-slate-600">ARENAGG © 2026</p>
        </div>
      </div>
    </form>
  );
}
