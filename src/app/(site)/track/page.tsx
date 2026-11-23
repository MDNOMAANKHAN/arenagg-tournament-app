import type { Metadata } from 'next';
import TrackRegistrationForm from '@/components/TrackRegistrationForm';

export const metadata: Metadata = {
  title: 'Track Registration',
  description: 'Look up your ARENAGG registration and check whether your team is approved to play.',
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <main className="wrap py-10 sm:py-14">
      <section className="mx-auto max-w-xl">
        <div className="card border-cyan-300/15 bg-gradient-to-br from-[#101e36]/95 to-[#080f1d]/95 p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.25em] text-cyan-300">PLAYER PORTAL</p>
          <h1 className="mt-3 text-3xl font-black text-white">Track your registration</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Enter the registration ID you received after registering. See whether your application is pending, approved, or rejected—and whether payment is verified.</p>
          <TrackRegistrationForm />
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your registration ID is private. Don’t share it publicly; anyone with the ID may be able to view your registration status.</p>
      </section>
    </main>
  );
}
