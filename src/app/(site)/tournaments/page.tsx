import type { Metadata } from 'next';

import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import {
  fmt,
  gameColor,
  slotInfo,
  type PublicTournament,
} from '@/lib/format';

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

export default async function TournamentsPage() {
  const sb = supabaseServer();

  const { data: games } = await sb.from('games').select('slug,name').order('name');

  const { data } = await sb
    .from('tournament_public')
    .select('*')
    .in('status', ['open', 'closed', 'live'])
    .order('starts_at');

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
      <main className="arena-tournaments-page arena-page-backdrop wrap py-10 sm:py-14">
      <section className="arena-tournaments-hero mb-8 overflow-hidden rounded-3xl border border-cyan-300/15 p-6 sm:p-9">
        <p className="text-xs font-black tracking-[0.25em] text-cyan-300">COMMUNITY COMPETITIONS</p>
        <h1 className="mb-2 mt-3 text-4xl font-black tracking-tight sm:text-5xl">Find your next arena.</h1>
        <p className="mb-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Browse tournaments, choose your game, and bring your squad. {ts.length} event{ts.length === 1 ? '' : 's'} currently listed.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link className="arena-game-filter" href="/">All games</Link>
          {(games ?? []).map((g) => (
            <Link key={g.slug} className="arena-game-filter" href={`/?game=${g.slug}#tournaments`}>{g.name}</Link>
          ))}
          <Link className="arena-game-filter arena-filter-secondary" href="/results">View results ↗</Link>
        </div>
      </section>

      <div className="arena-tournament-list-heading mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] text-cyan-300">READY TO COMPETE</p>
          <h2 className="mt-1 text-2xl font-black">Available tournaments</h2>
        </div>
        <span className="arena-tournament-count rounded-full border border-cyan-300/15 px-3 py-1.5 text-xs font-bold text-cyan-200">{ts.length} events</span>
      </div>

      {ts.length ? (
        <div className="arena-tournament-grid grid gap-4 lg:grid-cols-2">
          {ts.map((t) => {
            const s = slotInfo(t);

            return (
              <article key={t.id} className="arena-tournament-card card group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
                <Link
                  href={`/tournaments/${t.id}`}
                  aria-label={`View full details for ${t.title}`}
                  className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
                />
                <div className="arena-tournament-card-content pointer-events-none relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-black tracking-widest"
                    style={{ color: gameColor(t.game_slug) }}
                  >
                    {t.game_name.toUpperCase()}
                  </span>

                  <span
                    className={`st ${
                      s.canRegister
                        ? 'ok'
                        : t.status === 'cancelled'
                        ? 'bad'
                        : t.status === 'live'
                        ? 'info'
                        : 'gray'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-black text-white transition-colors group-hover:text-cyan-300 sm:text-2xl">
                  {t.title}
                </h2>

                <p className="mt-2 text-sm text-muted">
                  {fmt(t.starts_at)} ·{' '}
                  {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`} ·{' '}
                  {t.registered}/{t.max_teams} teams ·{' '}
                  {t.entry_fee > 0 ? `₹${t.entry_fee} entry` : 'Free entry'}
                </p>

                <div className="arena-tournament-actions mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300">
                    View tournament details →
                  </span>

                  {s.canRegister && (
                    <Link href={`/register/${t.id}`} className="btn sm pointer-events-auto relative z-20">
                      Register now →
                    </Link>
                  )}
                </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="arena-tournaments-empty card text-center text-muted">
          No upcoming or live tournaments are available right now. Check the Results page for completed competitions.
        </div>
      )}
      </main>
    </>
  );
}
