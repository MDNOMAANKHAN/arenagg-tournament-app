'use client';

import { useState } from 'react';

export default function PrivacyRequestPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true); setError(''); setReference('');
    const form = new FormData(formElement);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/privacy-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json }, body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error || 'Could not submit your request.'); return; }
      setReference(result.reference || 'Submitted');
      formElement.reset();
    } catch {
      setError('Could not submit your request. Please check your connection.');
    } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Privacy</p>
      <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">Privacy request & grievance</h1>
      <p className="mt-4 text-sm leading-7 text-slate-400">Use this form to request information about personal data, correction, deletion where applicable, withdrawal of consent, or to raise a privacy grievance. Parents or guardians may submit requests concerning a child. We verify identity and authority before acting; some records may need to be retained for legal, payment, security or dispute reasons.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <div className="grid gap-2"><label htmlFor="request_type" className="text-sm font-semibold text-slate-200">Request type</label><select id="request_type" name="request_type" required className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white"><option value="access">Request information about my data</option><option value="correction">Correct my information</option><option value="deletion">Request deletion (where applicable)</option><option value="consent_withdrawal">Withdraw consent</option><option value="grievance">Privacy grievance / complaint</option><option value="parent_minor">Parent/guardian request for a minor</option><option value="other">Other privacy question</option></select></div>
        <div className="grid gap-2"><label htmlFor="requester_name" className="text-sm font-semibold text-slate-200">Your name</label><input id="requester_name" name="requester_name" required minLength={2} maxLength={100} className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white" /></div>
        <div className="grid gap-2"><label htmlFor="contact" className="text-sm font-semibold text-slate-200">Email or phone number used for registration</label><input id="contact" name="contact" required minLength={5} maxLength={120} autoComplete="email" className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white" /></div>
        <div className="grid gap-2"><label htmlFor="registration_code" className="text-sm font-semibold text-slate-200">Registration code (optional)</label><input id="registration_code" name="registration_code" maxLength={40} placeholder="AGG-…" className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white" /></div>
        <div className="grid gap-2"><label htmlFor="details" className="text-sm font-semibold text-slate-200">Details of your request</label><textarea id="details" name="details" required minLength={10} maxLength={2000} rows={5} className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white" placeholder="Describe the information or action you are requesting. For a parent/guardian request, explain your relationship without attaching identity documents here." /></div>
        <div aria-hidden="true" className="hidden"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <p className="text-xs leading-5 text-slate-500">Do not include passwords, OTPs, UPI PINs, card details or government identity numbers. This form creates a request for review; it does not immediately delete data. We will verify the requester and assess applicable legal retention requirements. We aim to respond promptly and within the time required by applicable law.</p>
        {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        {reference && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Request received. Reference: {reference}. Keep this reference for follow-up.</p>}
        <button disabled={busy} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit privacy request'}</button>
      </form>
      <p className="mt-6 text-sm leading-6 text-slate-400">If you cannot use the form, call 7330804540. The operator's formal legal identity, address and designated grievance contact must be published before commercial launch.</p>
    </main>
  );
}
