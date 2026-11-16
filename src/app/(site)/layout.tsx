import Image from "next/image";
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
        className="skip-link"
      >
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
            <Link href="/tournaments" className="public-nav-link">Tournaments</Link>
            <Link href="/results" className="public-nav-link">Results</Link>
            <Link href="/about" className="public-nav-link">About</Link>
            <Link href="/contact" className="public-nav-link">Contact</Link>
          </nav>
        </div>
      </header>

      <div id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        {children}
      </div>

      <footer className="mt-auto shrink-0 border-t border-blue-200/10 bg-[#071225]/70 py-8 text-xs text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-black tracking-wide text-white">
              <Image src="/arenagg-mark.svg" alt="" width={24} height={24} />
              ARENA<span className="text-[#60A5FA]">GG</span>
            </Link>
            <p className="mt-3 max-w-xs leading-6">Play. Compete. Rise. A community platform for discovering and joining esports tournaments.</p>
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-[0.16em] text-slate-200">Explore</h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/" className="hover:text-cyan-300">Home</Link>
              <Link href="/tournaments" className="hover:text-cyan-300">Tournaments</Link>
              <Link href="/results" className="hover:text-cyan-300">Results</Link>
              <Link href="/about" className="hover:text-cyan-300">About</Link>
              <Link href="/contact" className="hover:text-cyan-300">Contact</Link>
            </div>
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-[0.16em] text-slate-200">Get in touch</h2>
            <a className="mt-3 block hover:text-cyan-300" href="tel:7330804540">Call: 7330804540</a>
            <a className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-blue-300/30 bg-blue-400/10 px-4 font-bold text-blue-100 hover:bg-blue-400/15" href="https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q" target="_blank" rel="noopener noreferrer">Join WhatsApp Channel ↗</a>
          </div>
        </div>
        <div className="mx-auto mt-7 flex max-w-7xl flex-col gap-2 border-t border-white/10 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} ARENAGG. All rights reserved.</span>
          <span>Community esports · Not affiliated with game publishers.</span>
        </div>
      </footer>
    </div>
  );
}
