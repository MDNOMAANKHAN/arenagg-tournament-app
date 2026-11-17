import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ARENAGG",
  description:
    "Learn about ARENAGG and its community information for players interested in Free Fire MAX, BGMI and Valorant.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About ARENAGG",
    description: "Learn about ARENAGG, its community and the games featured on the website.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="arena-page relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <section className="arena-premium-card rounded-3xl border border-blue-300/15 bg-[#0b1424]/80 p-7 shadow-xl shadow-blue-950/20 backdrop-blur-xl sm:p-12">
          <p className="text-xs font-black tracking-[0.3em] text-cyan-300">WHO WE ARE</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
            About <span className="arena-gradient-text">ARENAGG</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-bold text-blue-100 sm:text-2xl">
            Play. Compete. Rise.
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
            ARENAGG is a community esports platform built to make online
            tournaments easier to discover and join. We bring players and teams
            together to take part in community competitions, follow tournament
            updates and celebrate results.
          </p>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            ["🎮", "Community first", "A place for players and teams to connect through competitive gaming."],
            ["🏆", "Compete together", "Discover tournaments, review the details and register your team."],
            ["📊", "Follow the journey", "Keep up with tournament schedules and published results."],
          ].map(([icon, heading, description]) => (
            <article key={heading} className="arena-premium-card rounded-2xl border border-blue-300/15 bg-[#0b1424]/80 p-6">
              <div className="text-3xl" aria-hidden="true">{icon}</div>
              <h2 className="mt-4 text-lg font-extrabold text-white">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.05] p-6 sm:p-8">
          <h2 className="text-xl font-black text-white">Games and competitions</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            ARENAGG features community tournament experiences for Free Fire MAX,
            BGMI and Valorant. Tournament availability, eligibility, schedules
            and rules are shown on each tournament listing.
          </p>
          <Link href="/tournaments" className="arena-glass-button mt-6">
            Explore tournaments <span aria-hidden="true">→</span>
          </Link>
        </section>

        <p className="mt-8 text-xs leading-6 text-slate-500">
          ARENAGG is an independent community platform and is not affiliated
          with or endorsed by the publishers of the games featured.
        </p>
      </div>
    </main>
  );
}
