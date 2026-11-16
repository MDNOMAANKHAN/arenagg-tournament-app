import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About ArenaGG',
  description: 'Learn about ArenaGG, a community esports platform for discovering tournaments and bringing players together.',
  alternates: { canonical: '/about' },
};

const values = [
  { icon: '🎮', title: 'Community first', text: 'A welcoming place for players and teams to discover competitions and grow together.' },
  { icon: '⚔️', title: 'Fair competition', text: 'Clear tournament information, published rules and organized match experiences.' },
  { icon: '🏆', title: 'Every match matters', text: 'A place to compete, improve, celebrate teamwork and follow published results.' },
];

export default function AboutPage() {
  return (
    <main className="arena-page min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#102849] via-[#0b1930] to-[#070e1d] p-7 shadow-2xl shadow-blue-950/30 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-black tracking-[0.28em] text-cyan-300">WHO WE ARE</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">About <span className="arena-gradient-text">ArenaGG</span></h1>
            <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
              ArenaGG is a community esports platform built to make it easier for players to discover tournaments, register their teams and follow competition results.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tournaments" className="arena-glass-button">Explore tournaments →</Link>
              <Link href="/contact" className="arena-glass-secondary">Contact our team</Link>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="arena-premium-card rounded-2xl p-6">
              <div className="text-3xl" aria-hidden="true">{value.icon}</div>
              <h2 className="mt-5 text-xl font-black text-white">{value.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{value.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-blue-300/15 bg-[#0b172a]/80 p-7 sm:p-10">
          <p className="text-xs font-black tracking-[0.24em] text-cyan-300">OUR GAMES</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Find your arena. Build your squad.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            ArenaGG features community competitions for games such as Free Fire MAX, BGMI and Valorant. Tournament availability, formats, entry fees and schedules are shown on each tournament listing.
          </p>
          <p className="mt-4 text-xs leading-6 text-slate-500">ArenaGG is an independent community platform and is not affiliated with or endorsed by the publishers of the games featured on this website.</p>
        </section>
      </div>
    </main>
  );
}
