'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';

/** Permanently remove a cancelled tournament and its dependent records. */
export default function RemoveCancelledTournament({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const confirmed = window.confirm(
      `Permanently remove "${title}"? This deletes the cancelled tournament and its registrations, matches and results. This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await adminApi('tournaments', 'DELETE', undefined, `?id=${id}`);
      router.refresh();
    } catch (error: any) {
      window.alert(error?.message || 'Could not remove this tournament.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 px-3 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
    >
      {busy ? 'Removing…' : 'Remove'}
    </button>
  );
}
