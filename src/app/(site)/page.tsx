
import Link from "next/link";
import GameShowcase from "@/components/GameShowcase";
import { supabaseServer } from "@/lib/supabase/server";
import TournamentCard from "@/components/TournamentCard";
import type { PublicTournament } from "@/lib/format";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: {
    game?: string;
  };
};

export default async function HomePage({ searchParams }: HomeProps) {
  // Existing Supabase data fetching — preserved
  const sb = supabaseServer();

  const { data: games } = await sb
    .from("games")
    .select("slug,name")
    .order("name");

  let q = sb
    .from("tournament_public")
    .select("*")
    .in("status", ["open", "closed", "live"])
    .order("starts_at");

  if (searchParams.game) {
    q = q.eq("game_slug", searchParams.game);
  }

  const { data } = await q;
  const ts = (data ?? []) as PublicTournament[];

  const steps = [
    [
      "Pick a tournament",
      "See the date, time, team size and slots left.",
    ],
    [
      "Register your team",
      "No account needed. Add captain, teammates and gaming IDs.",
    ],
    [
      "Get your ID",
      "Save your registration ID. The organizer approves your team.",
    ],
  ];

  return (
    <main className="arena-page min-h-screen px-4 py-6 sm:px-8">
      <div className="relative z-10 mx-auto max-w-7xl">

        {/* HERO SECTION */}
        <section className="arena-hero arena-animate mt-5 flex items-center p-7 sm:p-12">
          <div className="max-w-xl">

            <span className="arena-badge">
              ✦ India's Community Esports Platform
            </span>

            <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-7xl">
              ARENA<span className="text-blue-400">GG</span>
            </h1>

            <p className="mt-4 text-xl font-bold text-blue-100 sm:text-2xl">
              Play. Compete. Rise.
            </p>

            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
              Discover tournaments, connect with players and compete
              in Free Fire MAX, BGMI and Valorant.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#tournaments" className="arena-glass-button">
                Explore Tournaments →
              </Link>

              <Link
                href="/results"
                className="arena-glass-button arena-glass-secondary"
              >
                View Results
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="arena-badge">Free Registration</span>
              <span className="arena-badge">Community Gaming</span>
            </div>

          </div>
        </section>

        {/* GAME SHOWCASE */}
        <GameShowcase />

        {/* HOW IT WORKS */}
        <section className="relative z-10 mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-[0.25em] text-blue-300">
              GET STARTED
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              How ARENAGG works
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(([heading, description], i) => (
              <div
                key={heading}
                className="arena-premium-card arena-animate"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/20 font-bold text-blue-200">
                  0{i + 1}
                </div>

                <h3 className="mb-2 mt-5 text-xl font-bold text-white">
                  {heading}
                </h3>

                <p className="text-sm leading-relaxed text-slate-300">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TOURNAMENT SECTION */}
        <section id="tournaments" className="relative z-10 py-16">

          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-blue-300">
                COMPETE NOW
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Tournaments
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Find your next competition.
              </p>
            </div>

            {/* Existing game filters — preserved */}
            <div className="flex flex-wrap gap-2">
              <Link
                scroll={false}
                href="/#tournaments"
                className={`arena-glass-button arena-glass-secondary ${
                  !searchParams.game ? "border-blue-400/70" : ""
                }`}
              >
                All
              </Link>

              {(games ?? []).map((g) => (
                <Link
                  scroll={false}
                  key={g.slug}
                  href={`/?game=${g.slug}#tournaments`}
                  className={`arena-glass-button arena-glass-secondary ${
                    searchParams.game === g.slug
                      ? "border-blue-400/70 bg-blue-500/20"
                      : ""
                  }`}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Existing tournament cards — preserved */}
          {ts.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ts.map((t, i) => (
                <div key={t.id} className="arena-animate">
                  <TournamentCard t={t} i={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="arena-premium-card text-center">
              <div className="text-4xl">🏆</div>

              <h3 className="mt-4 text-xl font-bold text-white">
                No tournaments available
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                No tournaments are open right now. Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 border-t border-blue-200/10 py-7 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ARENAGG. Game On. Rise Together.
        </footer>

      </div>
    </main>
  );
}
