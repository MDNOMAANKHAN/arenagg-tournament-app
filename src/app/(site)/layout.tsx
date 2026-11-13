import Link from "next/link";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050b18] text-white">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-[#1685ff] px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#45d7ff]"
      >
        Skip to main content
      </a>

      <header className="shrink-0 border-b border-blue-200/10 bg-[#050b18]/90">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link
            href="/"
            aria-label="ARENAGG home"
            className="inline-flex min-h-11 items-center rounded-lg text-[22px] font-extrabold tracking-tight transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#45d7ff]"
          >
            ARENA<span className="text-[#60A5FA]">GG</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-1 text-sm font-medium text-[#C7D2E8]"
          >
            <Link
              href="/tournaments"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45d7ff]"
            >
              Tournaments
            </Link>
            <Link
              href="/results"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45d7ff]"
            >
              Results
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="mt-auto shrink-0 border-t border-blue-200/10 py-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          © ARENAGG · Community esports. Not affiliated with game publishers.
        </div>
      </footer>
    </div>
  );
}
