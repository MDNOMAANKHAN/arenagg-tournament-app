
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_BYTES = 5 * 1024 * 1024;

export default function PaymentProofUpload({
  code,
  alreadyUploaded,
  rejected,
}: {
  code: string;
  alreadyUploaded: boolean;
  rejected: boolean;
}) {
  const r = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [utr, setUtr] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(alreadyUploaded);

  function pick(f: File | null) {
    setErr('');
    if (!f) {
      setFile(null);
      setPreview('');
      return;
    }
    if (f.size > MAX_BYTES) {
      setErr('That screenshot is larger than 5 MB. Please pick a smaller one.');
      setFile(null);
      setPreview('');
      return;
    }
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) {
      setErr('Upload a PNG, JPG or WEBP screenshot.');
      setFile(null);
      setPreview('');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErr('Choose a screenshot of your payment first.');
      return;
    }

    setBusy(true);
    setErr('');

    try {
      const body = new FormData();
      body.append('file', file);
      if (utr.trim()) body.append('utr', utr.trim());

      const res = await fetch(`/api/register/${encodeURIComponent(code)}/payment-proof`, {
        method: 'POST',
        body,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || 'Could not upload the screenshot. Please try again.');
        return;
      }

      setDone(true);
      setFile(null);
      setPreview('');
      r.refresh();
    } catch {
      setErr('Could not upload the screenshot. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (rejected) {
    return (
      <p className="text-sm leading-6 text-slate-400">
        This registration was rejected, so a payment screenshot can no longer be
        submitted. Contact the organiser if you think this is a mistake.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">

      {done && (
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/[0.07] p-4 text-sm leading-6 text-emerald-200">
          <b>Payment screenshot received.</b> The organiser will check it and
          approve your team. You can upload a clearer screenshot below if needed.
        </div>
      )}

      <div>
        <label
          htmlFor="proof"
          className="mb-2 block text-xs font-black tracking-[0.2em] text-slate-400"
        >
          PAYMENT SCREENSHOT
        </label>

        <input
          ref={input}
          id="proof"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => pick(e.currentTarget.files?.[0] ?? null)}
          className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-xs file:font-bold file:text-cyan-200 hover:border-cyan-400/30"
        />

        <p className="mt-2 text-[11px] leading-5 text-slate-500">
          PNG, JPG or WEBP · up to 5 MB. Only the organiser can see this.
        </p>
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Payment screenshot preview"
          className="max-h-64 w-fit rounded-xl border border-white/10"
        />
      )}

      <div>
        <label
          htmlFor="utr"
          className="mb-2 block text-xs font-black tracking-[0.2em] text-slate-400"
        >
          UPI REFERENCE / UTR <span className="font-semibold text-slate-600">(optional but speeds up approval)</span>
        </label>

        <input
          id="utr"
          name="utr"
          value={utr}
          onChange={(e) => setUtr(e.currentTarget.value)}
          maxLength={40}
          autoComplete="off"
          placeholder="e.g. 423456789012"
          className="input w-full min-w-0 transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {err && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !file}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Uploading…' : done ? 'Replace screenshot' : 'Upload payment screenshot'}
      </button>

    </form>
  );
}
