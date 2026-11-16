import Image from "next/image";
import Link from "next/link";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050b18] text-white">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="shrink-0 border-b border-blue-200/10 bg-[#050b18]/90">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link
            href="/"
            aria-label="ARENAGG home"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-lg transition-opacity duration-200 hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#45d7ff]"
          >
            <Image
              src="/arenagg-mark.svg"
              alt=""
              width={42}
              height={42}
              priority
              className="h-10 w-10 shrink-0 drop-shadow-[0_0_12px_rgba(37,140,255,0.28)]"
            />
            <span className="text-[22px] font-black tracking-[-0.055em]">
              ARENA<span className="text-[#60A5FA]">GG</span>
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-1 text-sm font-medium text-[#C7D2E8]"
          >
            <Link href="/" className="public-nav-link">Home</Link>
            <Link href="/about" className="public-nav-link">About</Link>
            <Link href="/tournaments" className="public-nav-link">Tournaments</Link>
            <Link href="/results" className="public-nav-link">Results</Link>
            <Link href="/contact" className="public-nav-link">Contact Us</Link>
          </nav>
        </div>
      </header>

      <div id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        {children}
      </div>

      <footer className="mt-auto shrink-0 border-t border-blue-200/10 py-6 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-wide text-slate-300">
            <Image src="/arenagg-mark.svg" alt="" width={20} height={20} />
            ARENAGG
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-cyan-300">About</Link>
            <Link href="/tournaments" className="hover:text-cyan-300">Tournaments</Link>
            <Link href="/results" className="hover:text-cyan-300">Results</Link>
            <Link href="/contact" className="hover:text-cyan-300">Contact Us</Link>
          </nav>
          <span>© {new Date().getFullYear()} ARENAGG · Community esports. Not affiliated with game publishers.</span>
        </div>
      </footer>
    </div>
  );
}
