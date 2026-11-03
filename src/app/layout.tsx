
import Link from 'next/link';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="shrink-0 bg-ink text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5">
          <Link
            href="/"
            className="text-[22px] font-extrabold tracking-tight"
          >
            ARENA<span className="text-[#60A5FA]">GG</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-[#C7D2E8]">
            <Link href="/#tournaments">Tournaments</Link>
            <Link href="/results">Results</Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        {children}
      </div>

      <footer className="mt-auto shrink-0 border-t border-line py-6 text-xs text-muted">
        <div className="wrap">
          © ARENAGG · Community esports. Not affiliated with game publishers.
        </div>
      </footer>
    </div>
  );
}
