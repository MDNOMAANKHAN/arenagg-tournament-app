
import Link from "next/link";
import Image from "next/image";
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

  // Only filter by a slug that actually exists, so a stale/typo'd ?game= link
  // (e.g. ?game=freefire) still shows the full list instead of an empty page.
  const gameSlugs = new Set((games ?? []).map((g) => g.slug));
  const activeGame =
    searchParams.game && gameSlugs.has(searchParams.game)
      ? searchParams.game
      : "";

  let q = sb
    .from("tournament_public")
    .select("*")
    .in("status", ["open", "closed", "live"])
    .order("starts_at");

  if (activeGame) {
    q = q.eq("game_slug", activeGame);
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
    <main className="arena-page relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* HERO SECTION */}
        <section className="arena-hero arena-animate relative mt-4 overflow-hidden rounded-3xl border border-blue-300/15 p-7 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-12 lg:p-16">

          <Image
            src="/games/hero-gaming.jpg"
            alt=""
            fill
            priority
            quality={75}
            sizes="100vw"
            className="arena-hero-image"
          />

          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />

          <div className="relative z-10 max-w-2xl">

            <span className="arena-badge inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              ✦ India's Community Esports Platform
            </span>

            <h1 className="mt-7 text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
              ARENA
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                GG
              </span>
            </h1>

            <p className="mt-5 text-xl font-extrabold tracking-wide text-blue-100 sm:text-3xl">
              Play. Compete. Rise.
            </p>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Discover tournaments, connect with players and compete
              in Free Fire MAX, BGMI and Valorant.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="#tournaments"
                className="arena-glass-button group transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25"
              >
                Explore Tournaments
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/results"
                className="arena-glass-button arena-glass-secondary transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:text-cyan-300"
              >
                View Results
              </Link>

            </div>

            <div className="mt-8 flex flex-wrap gap-3">
             
              <span className="arena-badge">🎮 Community Gaming</span>
            </div>

          </div>
        </section>

        {/* GAME SHOWCASE */}
        <section className="mt-12">
          <GameShowcase />
        </section>

        {/* HOW IT WORKS */}
        <section className="relative mt-20">

          <div className="mb-8">
            <p className="text-xs font-black tracking-[0.3em] text-cyan-300">
              GET STARTED
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              How ARENAGG works
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Three simple steps to join the competition and play with your team.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {steps.map(([heading, description], i) => (
              <div
                key={heading}
                className="arena-premium-card group relative overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#101d35]/90 to-[#080f20]/90 p-6 shadow-lg shadow-blue-950/20 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/40 hover:shadow-xl hover:shadow-cyan-500/10"
                style={{
                  animation: "fadeInUp .6s ease-out both",
                  animationDelay: `${i * 120}ms`,
                }}
              >

                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-sm font-black text-cyan-200 shadow-lg shadow-cyan-500/10">
                    0{i + 1}
                  </div>

                  <span className="text-2xl text-white/20 transition duration-300 group-hover:scale-125 group-hover:text-cyan-300">
                    ✦
                  </span>
                </div>

                <h3 className="relative mb-3 mt-7 text-xl font-extrabold text-white transition group-hover:text-cyan-200">
                  {heading}
                </h3>

                <p className="relative text-sm leading-7 text-slate-400">
                  {description}
                </p>

              </div>
            ))}

          </div>
        </section>

        {/* TOURNAMENT SECTION */}
        <section id="tournaments" className="relative mt-20 scroll-mt-24 pb-12">

          <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">

            <div>
              <p className="text-xs font-black tracking-[0.3em] text-cyan-300">
                COMPETE NOW
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Tournaments
              </h2>

              <p className="mt-3 text-sm text-slate-400 sm:text-base">
                Find your next competition and bring your team to victory.
              </p>
            </div>

            {/* EXISTING GAME FILTERS — PRESERVED */}
            <div className="flex flex-wrap gap-2">

              <Link
                scroll={false}
                href="/#tournaments"
                className={`arena-glass-button arena-glass-secondary rounded-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 ${
                  !activeGame
                    ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/10"
                    : ""
                }`}
              >
                All
              </Link>

              {(games ?? []).map((g) => (
                <Link
                  scroll={false}
                  key={g.slug}
                  href={`/?game=${g.slug}#tournaments`}
                  className={`arena-glass-button arena-glass-secondary rounded-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 ${
                    activeGame === g.slug
                      ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/10"
                      : ""
                  }`}
                >
                  {g.name}
                </Link>
              ))}

            </div>
          </div>

          {/* TOURNAMENT CARDS — EXISTING DATA AND COMPONENT PRESERVED */}
          {ts.length ? (

            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {ts.map((t, i) => (
                <div
                  key={t.id}
                  className="arena-animate h-full"
                  style={{
                    animation: "fadeInUp .6s ease-out both",
                    animationDelay: `${Math.min(i * 100, 600)}ms`,
                  }}
                >
                  <div className="h-full transition duration-300 hover:-translate-y-1">
                    <TournamentCard t={t} i={i} />
                  </div>
                </div>
              ))}

            </div>

          ) : (

            <div className="arena-premium-card relative overflow-hidden rounded-2xl border border-blue-300/15 bg-[#0b1424]/80 px-5 py-16 text-center shadow-xl shadow-blue-950/20 backdrop-blur-xl">

              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[70px]" />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-4xl shadow-lg shadow-cyan-500/10">
                🏆
              </div>

              <h3 className="relative mt-6 text-xl font-black text-white">
                No tournaments available
              </h3>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                No tournaments are open right now. Check back soon for upcoming competitions.
              </p>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}
