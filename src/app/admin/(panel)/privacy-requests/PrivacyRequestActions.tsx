'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyRequestActions({ id, status, notes }: { id: string; status: string; notes: string }) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [adminNotes, setAdminNotes] = useState(notes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/privacy-requests/' + encodeURIComponent(id), {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, admin_notes: adminNotes }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error || 'Could not save changes.'); return; }
      router.refresh();
    } catch {
      setError('Could not save changes. Check your connection.');
    } finally { setBusy(false); }
  }
  return (
    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
      <label className="grid gap-1 text-xs text-slate-400">Review status
        <select value={nextStatus} onChange={(event) => setNextStatus(event.currentTarget.value)} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value="pending">Pending</option><option value="identity_verification">Identity verification</option><option value="in_review">In review</option><option value="completed">Completed</option><option value="declined">Declined</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-slate-400">Internal review notes
        <input value={adminNotes} onChange={(event) => setAdminNotes(event.currentTarget.value)} maxLength={2000} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="Record verification and action taken" />
      </label>
      <button type="button" disabled={busy} onClick={save} className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-black text-slate-950 disabled:opacity-50">{busy ? 'Saving…' : 'Save review'}</button>
      {error && <p role="alert" className="text-xs text-rose-300 sm:col-span-3">{error}</p>}
    </div>
  );
}
