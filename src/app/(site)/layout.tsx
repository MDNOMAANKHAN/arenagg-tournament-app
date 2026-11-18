import Image from "next/image";
import Link from "next/link";
import PublicNavigation from "@/components/PublicNavigation";

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

          <PublicNavigation />
        </div>
      </header>

      <div id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        {children}
      </div>

      <footer className="mt-auto shrink-0 border-t border-blue-200/10 bg-[#070f20] py-8 text-xs text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-wide text-slate-200">
              <Image src="/arenagg-mark.svg" alt="" width={24} height={24} />
              ARENAGG
            </Link>
            <p className="mt-3 max-w-xs leading-6 text-slate-500">
              Play. Compete. Rise. Your community esports platform.
            </p>
          </div>

          <div>
            <h2 className="font-black tracking-widest text-slate-200">QUICK LINKS</h2>
            <nav aria-label="Footer navigation" className="mt-3 flex flex-col items-start gap-2">
              <Link href="/about" className="transition-colors hover:text-cyan-300">About</Link>
              <Link href="/tournaments" className="transition-colors hover:text-cyan-300">Tournaments</Link>
              <Link href="/results" className="transition-colors hover:text-cyan-300">Results</Link>
              <Link href="/terms" className="transition-colors hover:text-cyan-300">Terms & Conditions</Link>
              <Link href="/privacy" className="transition-colors hover:text-cyan-300">Privacy Policy</Link>
            </nav>
          </div>

          <div>
            <h2 className="font-black tracking-widest text-slate-200">CONTACT US</h2>
            <div className="mt-3 flex flex-col items-start gap-2">
              <Link href="/contact" className="font-semibold text-cyan-300 transition-colors hover:text-white">
                Contact & Support →
              </Link>
              <a href="tel:7330804540" className="transition-colors hover:text-cyan-300">
                Call: 7330804540
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q?utm_source=chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cyan-300"
              >
                Official WhatsApp Channel ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 flex max-w-7xl flex-col gap-2 border-t border-white/[0.07] px-4 pt-5 leading-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} ARENAGG. All rights reserved.</span>
          <span>Community esports. Not affiliated with game publishers.</span>
        </div>
      </footer>
    </div>
  );
}
