import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact ArenaGG',
  description: 'Contact ArenaGG for tournament support and join the official WhatsApp channel for community updates.',
  alternates: { canonical: '/contact' },
};

const phone = '7330804540';
const channel = 'https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q';

export default function ContactPage() {
  return (
    <main className="arena-page min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#102849] via-[#0b1930] to-[#070e1d] p-7 shadow-2xl shadow-blue-950/30 sm:p-12">
          <p className="text-xs font-black tracking-[0.28em] text-cyan-300">WE ARE HERE TO HELP</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Have a question about a tournament, registration or results? Reach out to the ArenaGG team or follow our WhatsApp channel for announcements.
          </p>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-2">
          <article className="arena-premium-card rounded-2xl p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-2xl" aria-hidden="true">☎</div>
            <h2 className="mt-5 text-xl font-black text-white">Call ArenaGG</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">For tournament and platform enquiries, contact us by phone.</p>
            <a href={`tel:${phone}`} className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">
              {phone} · Call now
            </a>
          </article>

          <article className="arena-premium-card rounded-2xl p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-2xl" aria-hidden="true">✉</div>
            <h2 className="mt-5 text-xl font-black text-white">Join our WhatsApp Channel</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Get community announcements, tournament updates and important information from ArenaGG.</p>
            <a href={channel} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-blue-300/30 bg-blue-400/10 px-5 font-bold text-blue-100 transition hover:bg-blue-400/20">
              Join WhatsApp Channel ↗
            </a>
          </article>
        </section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          Looking for a competition? <Link href="/tournaments" className="font-bold text-cyan-300 hover:text-cyan-200">Browse current tournaments</Link> or <Link href="/results" className="font-bold text-cyan-300 hover:text-cyan-200">check published results</Link>.
        </div>
      </div>
    </main>
  );
}
