
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';

const TONE: Record<string, string> = {
  pending: 'wait',
  paid: 'ok',
  rejected: 'bad',
};

/**
 * Admin-side payment verification for one team.
 * Shows the uploaded screenshot and lets the organiser mark the UPI payment as
 * verified (or reject it) independently of the team's approval status.
 */
export default function PaymentProofCell({
  registrationId,
  amount,
  status,
  hasProof,
  utr,
}: {
  registrationId: string;
  amount: number | null;
  status: string | null;
  hasProof: boolean;
  utr: string | null;
}) {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function setPaymentStatus(next: 'pending' | 'paid' | 'rejected') {
    setBusy(true);
    setErr('');
    try {
      await adminApi('registrations', 'PATCH', {
        id: registrationId,
        payment_status: next,
      });
      r.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Could not update the payment status.');
    } finally {
      setBusy(false);
    }
  }

  const current = status ?? 'pending';

  return (
    <div className="grid min-w-[170px] gap-2">

      <div className="flex flex-wrap items-center gap-2">
        <span className={`st ${TONE[current] ?? 'wait'} whitespace-nowrap px-2.5 py-1 text-[11px]`}>
          {current === 'paid' ? 'Paid' : current === 'rejected' ? 'Rejected' : 'Unverified'}
        </span>

        {amount ? (
          <span className="whitespace-nowrap text-[11px] font-bold text-slate-300">
            ₹{amount}
          </span>
        ) : null}
      </div>

      {hasProof ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-400/20"
        >
          View screenshot
        </button>
      ) : (
        <span className="text-[11px] text-slate-500">
          No screenshot yet
        </span>
      )}

      {utr && (
        <p className="break-all text-[11px] text-slate-400">
          UTR: <span className="font-mono">{utr}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {current !== 'paid' && (
          <button
            type="button"
            disabled={busy || !hasProof}
            onClick={() => setPaymentStatus('paid')}
            title={hasProof ? 'Mark UPI payment as received' : 'Waiting for the screenshot'}
            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark paid
          </button>
        )}

        {current !== 'pending' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setPaymentStatus('pending')}
            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            Unverify
          </button>
        )}

        {current !== 'rejected' && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              window.confirm('Mark this payment as rejected?') &&
              setPaymentStatus('rejected')
            }
            className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
          >
            Reject
          </button>
        )}
      </div>

      {err && <p className="text-[11px] text-red-300">{err}</p>}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-full w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0b1425] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">Payment screenshot</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/admin/payment-proof/${registrationId}`}
              alt="Payment screenshot uploaded by the team"
              className="mx-auto max-h-[70vh] w-auto rounded-xl"
            />

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Only signed-in admins can open this file.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
