import type { Metadata } from 'next';
import Link from 'next/link';
import TournamentCard from '@/components/TournamentCard';
import { supabaseServer } from '@/lib/supabase/server';
import type { PublicTournament } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Tournament Information',
  description:
    'Explore active Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG. Check event dates, team sizes, entry details and registration availability.',
  alternates: { canonical: '/tournaments' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Community Tournament Information | ARENAGG',
    description:
      'Explore active Free Fire MAX, BGMI and Valorant community tournaments. Check event dates, team sizes, entry details and registration availability.',
    url: '/tournaments',
  },
  twitter: {
    card: 'summary',
    title: 'Esports Tournaments | ARENAGG',
    description:
      'Explore Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG.',
  },
};

type TournamentsPageProps = {
  searchParams?: { game?: string };
};

export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const sb = supabaseServer();
  const { data: games } = await sb.from('games').select('slug,name').order('name');
  const gameSlugs = new Set((games ?? []).map((g) => g.slug));
  const activeGame = searchParams?.game && gameSlugs.has(searchParams.game)
    ? searchParams.game
    : '';

  // Upcoming competitions and live events only. Registration is fail-closed in its own flow.
  const now = new Date().toISOString();
  let q = sb
    .from('tournament_public')
    .select('*')
    .in('status', ['open', 'closed', 'live'])
    .or(`starts_at.gt.${now},status.eq.live`)
    .order('starts_at');
  if (activeGame) q = q.eq('game_slug', activeGame);
  const { data } = await q;
  const ts = (data ?? []) as PublicTournament[];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Community Esports Tournaments | ARENAGG",
    url: "https://arenagg.live/tournaments",
    description:
      "Browse active Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG.",
    isPartOf: {
      "@type": "WebSite",
      name: "ARENAGG",
      url: "https://arenagg.live",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ts.map((t, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://arenagg.live/tournaments/${t.id}`,
        name: t.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main className="arena-page relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
        {/* Same atmosphere and section style as the homepage tournament section */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
          <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <section className="relative mt-4 scroll-mt-24 pb-12">
            <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="text-xs font-black tracking-[0.3em] text-cyan-300">
                  COMPETE NOW
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Tournaments
                </h1>
                <p className="mt-3 text-sm text-slate-400 sm:text-base">
                  {ts.length} tournament{ts.length === 1 ? '' : 's'} available. Find your next competition and bring your team to victory.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  scroll={false}
                  href="/tournaments"
                  className={`arena-glass-button arena-glass-secondary rounded-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 ${!activeGame ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/10" : ""}`}
                >
                  All
                </Link>
                {(games ?? []).map((g) => (
                  <Link
                    scroll={false}
                    key={g.slug}
                    href={`/tournaments?game=${g.slug}`}
                    className={`arena-glass-button arena-glass-secondary rounded-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 ${activeGame === g.slug ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/10" : ""}`}
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>

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
                <h2 className="relative mt-6 text-xl font-black text-white">
                  No tournaments available
                </h2>
                <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                  {activeGame
                    ? 'No upcoming or live tournaments for this game at the moment. Try another game or check back soon.'
                    : 'No tournaments are open right now. Check back soon for upcoming competitions.'}
                </p>
                {activeGame && (
                  <Link href="/tournaments" className="arena-glass-button arena-glass-secondary relative mt-5 inline-flex">
                    View all tournaments
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
