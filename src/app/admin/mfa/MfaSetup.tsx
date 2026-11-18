'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type Mode = 'loading' | 'enroll' | 'verify';

export default function MfaSetup() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: factorError } = await supabaseBrowser().auth.mfa.listFactors();
      if (!active) return;
      if (factorError) {
        setError('Could not check authenticator status. Refresh and try again.');
        setMode('enroll');
        return;
      }
      const verified = data.totp.find((factor) => factor.status === 'verified');
      if (verified) {
        setFactorId(verified.id);
        setMode('verify');
      } else {
        setMode('enroll');
      }
    })();
    return () => { active = false; };
  }, []);

  async function beginEnrollment() {
    setBusy(true);
    setError('');
    try {
      const { data, error: enrollError } = await supabaseBrowser().auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'ARENAGG administrator',
      });
      if (enrollError || !data?.id || !data.totp?.qr_code || !data.totp?.secret) {
        setError(enrollError?.message || 'Could not start authenticator setup.');
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setMode('verify');
    } catch {
      setError('Could not start authenticator setup. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const client = supabaseBrowser();
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge?.id) {
        setError(challengeError?.message || 'Could not start verification.');
        return;
      }
      const { error: verifyError } = await client.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        setError('That code was not accepted. Check your authenticator and try again.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'loading') return <p className="mt-6 text-sm text-slate-400">Checking authenticator status…</p>;

  return (
    <div className="mt-7">
      {mode === 'enroll' ? (
        <div>
          <p className="text-sm leading-6 text-slate-300">Add an authenticator app such as Google Authenticator, Microsoft Authenticator or 1Password. Then scan the QR code and verify a code.</p>
          <button type="button" onClick={beginEnrollment} disabled={busy} className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-black text-white disabled:opacity-60">{busy ? 'Preparing…' : 'Set up authenticator'}</button>
        </div>
      ) : (
        <div>
          {qrCode ? (
            <div className="mb-5 rounded-2xl border border-white/10 bg-white p-4 text-center">
              <img src={qrCode} alt="Authenticator setup QR code" className="mx-auto h-48 w-48" />
              <p className="mt-3 break-all font-mono text-xs text-slate-700">Manual setup key: {secret}</p>
            </div>
          ) : (
            <p className="mb-4 text-sm text-slate-300">Enter the current 6-digit code from your registered authenticator app.</p>
          )}
          <form onSubmit={verifyCode} className="grid gap-3">
            <label htmlFor="totp-code" className="text-sm font-semibold text-slate-200">Authenticator code</label>
            <input id="totp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.currentTarget.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-center font-mono text-2xl tracking-[0.45em] text-white outline-none focus:border-cyan-300" placeholder="000000" />
            <button type="submit" disabled={busy || code.length !== 6} className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">{busy ? 'Verifying…' : 'Verify and open admin'}</button>
          </form>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
    </div>
  );
}
