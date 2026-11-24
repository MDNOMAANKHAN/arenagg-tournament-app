'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/results', label: 'Results' },
  { href: '/track', label: 'Track' },
  { href: '/contact', label: 'Contact Us' },
];

export default function PublicNavigation() {
  const pathname = usePathname() || '/';
  const activeIndex = items.findIndex((item) =>
    item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const indicatorIndex = Math.max(0, activeIndex);

  return (
    <nav aria-label="Primary navigation" className="public-nav-slider relative isolate grid w-full grid-cols-6 items-stretch gap-1 rounded-2xl border border-blue-200/15 bg-white/[0.035] p-1.5 text-center text-[10px] font-semibold text-[#C7D2E8] shadow-lg shadow-blue-950/20 sm:w-auto sm:min-w-[540px] sm:gap-1.5 sm:p-2 sm:text-sm">
      <span
        aria-hidden="true"
        className="public-nav-indicator pointer-events-none absolute bottom-1 top-1 left-1 rounded-lg border border-cyan-300/20 bg-gradient-to-b from-cyan-400/15 to-blue-500/10 shadow-[0_0_18px_rgba(69,215,255,0.09)]"
        style={{ width: 'calc((100% - 20px) / 6)', transform: `translateX(calc(${indicatorIndex * 100}% + ${indicatorIndex * 2}px))` }}
      />
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`public-nav-link relative z-10 flex min-h-11 min-w-0 items-center justify-center rounded-xl px-1 py-2.5 text-[10px] font-bold transition-all duration-300 sm:min-h-11 sm:px-3 sm:text-sm ${active ? 'text-white drop-shadow-[0_0_10px_rgba(69,215,255,0.25)]' : 'text-[#AFC0D8] hover:bg-white/[0.05] hover:text-white'}`}
          >
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
