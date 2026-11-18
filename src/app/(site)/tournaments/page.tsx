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
    'Explore active Free Fire MAX, BGMI and Valorant community tournaments on ARENAGG. Check event dates, team sizes, entry details and availability.',
  alternates: { canonical: '/tournaments' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Community Tournament Information | ARENAGG',
    description:
      'Explore Free Fire MAX, BGMI and Valorant community tournament information on ARENAGG.',
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

  const [{ data: games }, { data }] = await Promise.all([
    sb.from('games').select('slug,name').order('name'),
    sb
      .from('tournament_public')
      .select('*')
      .in('status', ['open', 'closed', 'live'])
      .order('starts_at'),
  ]);

  const ts = (data ?? []) as PublicTournament[];
  const liveCount = ts.filter((t) => t.status === 'live').length;
  const openCount = ts.filter((t) => slotInfo(t).canRegister).length;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Community Esports Tournaments | ARENAGG',
    url: 'https://arenagg.live/tournaments',
    description:
      'Browse active Free Fire MAX, BGMI and Valorant community tournament information on ARENAGG.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ARENAGG',
      url: 'https://arenagg.live',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ts.map((t, index) => ({
        '@type': 'ListItem',
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
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <main className="arena-page min-h-screen overflow-hidden px-4 py-9 text-white sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-7xl">
          <section className="arena-glass relative isolate overflow-hidden rounded-3xl border border-cyan-300/15 px-5 py-8 shadow-2xl shadow-blue-950/20 sm:px-9 sm:py-11">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
            />

            <div className="text-[11px] font-black tracking-[0.28em] text-cyan-300">
              ARENAGG COMMUNITY
            </div>
            <div className="mt-3 grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                  Tournament <span className="text-cyan-300">Hub</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Find event information for Free Fire MAX, BGMI and Valorant.
                  Check schedules, team formats and the latest event status in
                  one place.
                </p>
              </div>

              <Link
                href="/"
                className="arena-glass-secondary inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                ← Back to home
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
                <div className="text-2xl font-black tabular-nums text-cyan-200">
                  {ts.length}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  LISTED EVENTS
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
                <div className="text-2xl font-black tabular-nums text-emerald-300">
                  {openCount}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  OPEN STATUS
                </div>
              </div>
              <div className="rounded-2xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
                <div className="text-2xl font-black tabular-nums text-blue-200">
                  {liveCount}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  LIVE EVENTS
                </div>
              </div>
            </div>
          </section>

          <section className="mt-9" aria-labelledby="event-list-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-black tracking-[0.24em] text-cyan-400">
                  EXPLORE THE ARENA
                </div>
                <h2 id="event-list-heading" className="mt-2 text-2xl font-black sm:text-3xl">
                  Available tournaments
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {ts.length} event{ts.length === 1 ? '' : 's'} listed across {(games ?? []).length} game categories.
                </p>
              </div>
            </div>

            {(games ?? []).length > 0 && (
              <nav aria-label="Browse tournaments by game" className="mt-5 flex flex-wrap gap-2">
                {(games ?? []).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/?game=${encodeURIComponent(g.slug)}#tournaments`}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.07] hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    {g.name}
                  </Link>
                ))}
              </nav>
            )}

            {ts.length > 0 ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {ts.map((t) => {
                  const s = slotInfo(t);
                  const color = t.game_slug === 'valorant' ? '#60A5FA' : gameColor(t.game_slug);
                  const statusClass =
                    t.status === 'live'
                      ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
                      : s.canRegister
                        ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200'
                        : 'border-white/10 bg-white/[0.055] text-slate-300';

                  return (
                    <article
                      key={t.id}
                      className="arena-tournament group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45 p-5 transition duration-300 sm:p-6"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                        style={{ backgroundColor: color }}
                      />

                      <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span
                            className="text-[11px] font-black tracking-[0.2em]"
                            style={{ color }}
                          >
                            {t.game_name.toUpperCase()}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-wider ${statusClass}`}>
                            {t.status === 'live' ? '● LIVE NOW' : s.label.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="mt-4 break-words text-xl font-black leading-snug text-white transition-colors group-hover:text-cyan-200 sm:text-2xl">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                          >
                            {t.title}
                          </Link>
                        </h3>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
                            <div className="text-[9px] font-bold tracking-[0.16em] text-slate-500">SCHEDULE</div>
                            <div className="mt-1 text-xs font-bold leading-5 text-slate-200">{fmt(t.starts_at)}</div>
                          </div>
                          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
                            <div className="text-[9px] font-bold tracking-[0.16em] text-slate-500">TEAM FORMAT</div>
                            <div className="mt-1 text-xs font-bold leading-5 text-slate-200">
                              {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`}
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
                            <div className="text-[9px] font-bold tracking-[0.16em] text-slate-500">TEAM COUNT</div>
                            <div className="mt-1 text-xs font-bold leading-5 text-slate-200">
                              {t.registered} / {t.max_teams} teams
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
                            <div className="text-[9px] font-bold tracking-[0.16em] text-slate-500">ENTRY DETAILS</div>
                            <div className="mt-1 text-xs font-bold leading-5 text-slate-200">
                              {t.entry_fee > 0 ? `₹${t.entry_fee} entry` : 'Free entry'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2 border-t border-white/[0.07] pt-4 sm:grid-cols-2">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-100 transition duration-200 hover:border-cyan-200/60 hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cyan-300"
                          >
                            Tournament Details <span aria-hidden="true">→</span>
                          </Link>
                          <Link
                            href="/results"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition duration-200 hover:border-blue-300/30 hover:bg-blue-300/[0.08] hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-300"
                          >
                            View Results <span aria-hidden="true">↗</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="arena-glass mt-5 rounded-2xl border border-white/10 px-5 py-12 text-center">
                <div aria-hidden="true" className="text-4xl">🏆</div>
                <h3 className="mt-4 text-lg font-black text-white">No events listed right now</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  There are no upcoming or live tournaments to display at the moment. Visit the Results page to explore completed competitions.
                </p>
                <Link
                  href="/results"
                  className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-cyan-300/25 px-4 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cyan-300"
                >
                  Explore results →
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
