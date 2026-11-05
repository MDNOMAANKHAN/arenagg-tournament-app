
import Link from "next/link";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050b18] text-white">
      <header className="shrink-0 border-b border-blue-200/10 bg-[#050b18]/90">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-8">
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

      <div className="flex-1">{children}</div>

      <footer className="mt-auto shrink-0 border-t border-blue-200/10 py-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          © ARENAGG · Community esports. Not affiliated with game publishers.
        </div>
      </footer>
    </div>
  );
}
