
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';

/**
 * Cancel a tournament from the admin dashboard.
 * Sets status to 'cancelled', which closes registration everywhere and keeps
 * the record (and its registrations) instead of deleting it.
 */
export default function CancelTournament({
  id,
  title,
  cancelled,
}: {
  id: string;
  title: string;
  cancelled: boolean;
}) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);

  if (cancelled) {
    return (
      <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.04] px-3 text-xs font-bold text-red-300/70">
        Cancelled
      </span>
    );
  }

  async function cancel() {
    const ok = confirm(
      `Cancel "${title}"?\n\nRegistration closes immediately and the tournament is marked cancelled on the public site. Existing registrations are kept.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      await adminApi('tournaments', 'PATCH', { id, status: 'cancelled' });
      r.refresh();
    } catch (e: any) {
      alert(e?.message || 'Could not cancel this tournament.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.04] px-3 text-xs font-bold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
    >
      {busy ? 'Cancelling…' : 'Cancel'}
    </button>
  );
}
