import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import SignOut from '@/components/SignOut';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const a = await getAdmin();

  if (!a) redirect('/admin/login?denied=1');

  return (
    <div className="admin-shell min-h-screen text-white lg:flex">
      <a href="#admin-main" className="skip-link">
        Skip to admin content
      </a>

      <aside className="admin-sidebar flex w-full flex-col p-4 sm:p-5 lg:sticky lg:top-0 lg:h-screen lg:w-[280px] lg:shrink-0">
        <Link href="/admin" className="admin-brand">
          <span className="brand-icon">A</span>
          <span>
            ARENA<span className="text-cyan-400">GG</span>
            <small>ESPORTS MANAGEMENT</small>
          </span>
        </Link>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav aria-label="Admin navigation" className="admin-nav mt-3 grid gap-2">
          <Link href="/admin" className="admin-nav-item">
            <span className="nav-icon" aria-hidden="true">▦</span>
            Dashboard
          </Link>

          <Link href="/admin#tournaments" className="admin-nav-item">
            <span className="nav-icon" aria-hidden="true">🏆</span>
            Tournaments
          </Link>

          <Link href="/admin/tournaments/new" className="admin-nav-item admin-nav-create">
            <span className="nav-icon" aria-hidden="true">＋</span>
            Create Tournament
          </Link>

          <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
            <span className="nav-icon" aria-hidden="true">↗</span>
            Public Website
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
        </nav>

        <div className="sidebar-create-card mt-8">
          <div className="text-2xl" aria-hidden="true">🎮</div>
          <div className="mt-3 text-sm font-bold">Ready for the next battle?</div>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Launch a new competition and bring your community together.
          </p>
          <Link href="/admin/tournaments/new" className="sidebar-create-button mt-4">
            <span aria-hidden="true">＋</span> New Tournament
          </Link>
        </div>

        <div className="admin-profile mt-5 lg:mt-auto">
          <div className="flex min-w-0 items-center gap-3">
            <div className="admin-avatar" aria-hidden="true">
              {(a.user.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-widest text-slate-500">
                ADMINISTRATOR
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-white">
                {a.user.email}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="admin-role">{a.role}</span>
            <span className="text-[10px] font-semibold text-emerald-400">Signed in</span>
          </div>

          <div className="mt-4 border-t border-white/[0.08] pt-3">
            <SignOut />
          </div>
        </div>
      </aside>

      <main id="admin-main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <header className="admin-topbar sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-8">
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-wider text-slate-400">
              ARENAGG <span className="text-cyan-400">/</span> ADMIN
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Admin workspace
            </div>
          </div>

          <Link href="/admin/tournaments/new" className="admin-top-create">
            <span className="text-lg" aria-hidden="true">＋</span>
            <span className="hidden sm:inline">Create Tournament</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </header>

        <div className="admin-content mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
          <div className="min-w-0 animate-[arenaFadeUp_500ms_ease_both]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
