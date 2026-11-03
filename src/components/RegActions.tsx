'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
export default function RegActions({ id, status }: { id: string; status: string }) {
  const r = useRouter(); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function set(s: string) { if (!window.confirm(`Change registration status to ${s}?`)) return; setBusy(true); setErr(''); try { await adminApi('registrations', 'PATCH', { id, status: s }); r.refresh(); } catch (x: any) { setErr(x.message); } setBusy(false); }
  return (<div className="flex flex-col gap-1.5">
    <div className="flex gap-1.5">
      {status !== 'approved' && <button disabled={busy} className="btn sm" onClick={() => set('approved')}>Approve</button>}
      {status !== 'rejected' && <button disabled={busy} className="btn sm danger" onClick={() => set('rejected')}>Reject</button>}
      {status !== 'pending' && <button disabled={busy} className="btn sm light" onClick={() => set('pending')}>Reset</button>}
    </div>{err && <div className="text-xs text-red-700">{err}</div>}</div>);
}
