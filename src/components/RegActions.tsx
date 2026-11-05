
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';

export default function RegActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function setRegistrationStatus(newStatus: string) {
    if (busy) return;

    if (
      newStatus === 'rejected' &&
      !window.confirm(
        'Are you sure you want to reject this registration?'
      )
    ) {
      return;
    }

    if (
      newStatus !== 'rejected' &&
      !window.confirm(`Change registration status to ${newStatus}?`)
    ) {
      return;
    }

    setBusy(true);
    setErr('');

    try {
      await adminApi('registrations', 'PATCH', {
        id,
        status: newStatus,
      });

      router.refresh();
    } catch (error: unknown) {
      setErr(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[170px] flex-col gap-2">

      <div className="flex flex-wrap items-center gap-2">

        {status !== 'approved' && (
          <button
            disabled={busy}
            onClick={() => setRegistrationStatus('approved')}
            className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <span className="transition-transform duration-300 group-hover:scale-125">
                ✓
              </span>
            )}
            Approve
          </button>
        )}

        {status !== 'rejected' && (
          <button
            disabled={busy}
            onClick={() => setRegistrationStatus('rejected')}
            className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <span className="transition-transform duration-300 group-hover:scale-125">
                ✕
              </span>
            )}
            Reject
          </button>
        )}

        {status !== 'pending' && (
          <button
            disabled={busy}
            onClick={() => setRegistrationStatus('pending')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-400/30 bg-slate-500/10 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↻ Reset
          </button>
        )}

      </div>

      {busy && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          Updating registration...
        </div>
      )}

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {err}
        </div>
      )}

    </div>
  );
}
