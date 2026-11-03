'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
export default function LoginForm({ denied }: { denied: boolean }) {
  const r = useRouter(); const [err, setErr] = useState(denied ? 'This account is not an administrator.' : ''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (denied) supabaseBrowser().auth.signOut(); }, [denied]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (error) { setErr('Invalid email or password.'); setBusy(false); return; }
    r.replace('/admin'); r.refresh();
  }
  return (<form onSubmit={submit} className="card w-full max-w-sm">
    <div className="mb-1 text-[22px] font-extrabold">ARENA<span className="text-acc">GG</span></div><div className="mb-5 text-[11px] font-bold tracking-widest text-muted">ADMIN · PRIVATE</div>
    <label className="l">Email</label><input name="email" type="email" required autoComplete="username" className="input mb-3" />
    <label className="l">Password</label><input name="password" type="password" required autoComplete="current-password" className="input mb-4" />
    {err && <div role="alert" className="mb-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-800">{err}</div>}
    <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form>);
}
