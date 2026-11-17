'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/results', label: 'Results' },
  { href: '/contact', label: 'Contact Us' },
];

export default function PublicNavigation() {
  const pathname = usePathname() || '/';
  const activeIndex = items.findIndex((item) =>
    item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const indicatorIndex = Math.max(0, activeIndex);

  return (
    <nav aria-label="Primary navigation" className="public-nav-slider relative isolate grid w-full grid-cols-5 items-stretch gap-0.5 rounded-xl border border-blue-200/10 bg-white/[0.025] p-1 text-center text-[11px] font-semibold text-[#C7D2E8] sm:w-auto sm:min-w-[440px] sm:text-sm">
      <span
        aria-hidden="true"
        className="public-nav-indicator pointer-events-none absolute bottom-1 top-1 left-1 rounded-lg border border-cyan-300/20 bg-gradient-to-b from-cyan-400/15 to-blue-500/10 shadow-[0_0_18px_rgba(69,215,255,0.09)]"
        style={{ width: 'calc((100% - 8px) / 5)', transform: `translateX(${indicatorIndex * 100}%)` }}
      />
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`public-nav-link relative z-10 flex min-h-10 min-w-0 items-center justify-center rounded-lg px-1.5 py-2 transition-colors duration-200 sm:px-3 ${active ? 'text-cyan-200' : 'text-[#C7D2E8] hover:text-white'}`}
          >
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
