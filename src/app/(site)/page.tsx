
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
    <main className="arena-home min-h-screen overflow-hidden px-4 pb-16 pt-5 sm:px-8">
      <div className="arena-home-ambient" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* CINEMATIC ARENA INTRO */}
        <section className="arena-home-hero relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px]">
          <Image src="/games/hero-gaming.jpg" alt="" fill priority quality={70} sizes="100vw" className="arena-home-hero-art" />
          <div className="arena-home-hero-shade" aria-hidden="true" />
          <div className="arena-home-hero-content relative z-10 flex min-h-[500px] flex-col justify-between p-6 sm:min-h-[580px] sm:p-10 lg:min-h-[620px] lg:p-14">
            <div className="flex items-center gap-2">
              <span className="arena-kicker"><span className="arena-live-dot" /> COMMUNITY ARENA / INDIA</span>
            </div>
            <div className="max-w-3xl py-12 sm:py-16">
              <p className="arena-eyebrow">YOUR TEAM. YOUR MOMENT.</p>
              <h1 className="arena-display mt-3 text-[clamp(3.4rem,12vw,8rem)] font-black leading-[.88] tracking-[-.075em]">
                ARENA<span>GG</span>
              </h1>
              <h2 className="mt-5 max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl">The next match is yours.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200/85 sm:text-base sm:leading-7">
                Find your squad, enter the competition and prove yourself across India’s community esports scene.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#tournaments" className="arena-home-primary">Enter the Arena <span aria-hidden="true">↗</span></Link>
                <Link href="/results" className="arena-home-ghost">Match results</Link>
              </div>
            </div>
            <div className="arena-hero-footer flex flex-wrap items-center justify-between gap-3">
              <span>FREE FIRE MAX <i>•</i> BGMI <i>•</i> VALORANT</span>
              <span className="arena-scroll-cue">SCROLL TO EXPLORE <b>↓</b></span>
            </div>
          </div>
          <div className="arena-hero-corner-mark" aria-hidden="true">AG<span> / </span>01</div>
        </section>

        {/* GAME SELECT — asymmetric feature layout */}
        <GameShowcase />

        {/* QUICK JOIN — compact editorial strip */}
        <section className="arena-join-strip mt-8 sm:mt-12">
          <div className="arena-join-intro">
            <p className="arena-eyebrow">THREE STEPS. ONE GOAL.</p>
            <h2>How to compete</h2>
            <p>Get from player to competitor without the complicated signup.</p>
          </div>
          <div className="arena-join-steps">
            {steps.map(([heading, description], i) => (
              <div className="arena-join-step" key={heading}>
                <span className="arena-step-number">0{i + 1}</span>
                <div>
                  <h3>{heading}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE COMPETITION LIST */}
        <section id="tournaments" className="arena-home-tournaments mt-16 scroll-mt-28 sm:mt-24">
          <div className="arena-section-heading">
            <div>
              <p className="arena-eyebrow">THE COMPETITION</p>
              <h2>Find your <span>match.</span></h2>
              <p>Choose a game. Lock in your squad. Make it count.</p>
            </div>
            <Link href="/tournaments" className="arena-home-ghost arena-all-tournaments">All tournaments <span>↗</span></Link>
          </div>
          <div className="arena-game-filter">
            <Link scroll={false} href="/#tournaments" className={!activeGame ? "active" : ""}>All games</Link>
            {(games ?? []).map((g) => (
              <Link scroll={false} key={g.slug} href={`/?game=${g.slug}#tournaments`} className={activeGame === g.slug ? "active" : ""}>{g.name}</Link>
            ))}
          </div>
          {ts.length ? (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ts.map((t, i) => (
                <div key={t.id} className="arena-animate h-full" style={{animation:"fadeInUp .6s ease-out both",animationDelay:`${Math.min(i*100,600)}ms`}}>
                  <TournamentCard t={t} i={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="arena-empty-state">
              <div className="arena-empty-icon">✦</div>
              <p className="arena-eyebrow">NEXT DROP LOADING</p>
              <h3>No open tournaments right now.</h3>
              <p>New competitions are announced here. Stay ready, squad up, and check back soon.</p>
              <Link href="/results" className="arena-home-ghost mt-5">See previous results ↗</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
