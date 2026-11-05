
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

      {/* SIDEBAR */}
      <aside className="admin-sidebar flex w-full flex-col p-5 lg:sticky lg:top-0 lg:h-screen lg:w-[280px] lg:shrink-0">

        {/* BRAND */}
        <Link href="/admin" className="admin-brand">
          <span className="brand-icon">A</span>
          <span>
            ARENA<span className="text-cyan-400">GG</span>
            <small>ESPORTS MANAGEMENT</small>
          </span>
        </Link>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        {/* NAVIGATION */}
        <nav className="mt-3 grid gap-2">

          <Link href="/admin" className="admin-nav-item">
            <span className="nav-icon">▦</span>
            Dashboard
            <span className="nav-indicator" />
          </Link>

          <Link href="/admin/tournaments/new" className="admin-nav-item admin-nav-create">
            <span className="nav-icon">＋</span>
            Create Tournament
          </Link>

          <Link href="/admin" className="admin-nav-item">
            <span className="nav-icon">🏆</span>
            Tournaments
          </Link>

          <Link
            href="/"
            target="_blank"
            className="admin-nav-item"
          >
            <span className="nav-icon">↗</span>
            Public Website
          </Link>

        </nav>

        {/* QUICK ACTION */}
        <div className="sidebar-create-card mt-8">
          <div className="text-2xl">🎮</div>
          <div className="mt-3 text-sm font-bold">
            Ready for the next battle?
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Launch a new competition and bring players together.
          </p>

          <Link
            href="/admin/tournaments/new"
            className="sidebar-create-button mt-4"
          >
            <span>＋</span> New Tournament
          </Link>
        </div>

        {/* ADMIN PROFILE */}
        <div className="admin-profile mt-8 lg:mt-auto">

          <div className="flex items-center gap-3">
            <div className="admin-avatar">
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

          <div className="mt-4 flex items-center justify-between">
            <span className="admin-role">{a.role}</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>

          <div className="mt-4 border-t border-white/[0.08] pt-3">
            <SignOut />
          </div>

        </div>

      </aside>

      {/* MAIN AREA */}
      <main className="min-w-0 flex-1">

        {/* TOP HEADER */}
        <header className="admin-topbar sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-3 px-5 sm:px-8">

          <div>
            <div className="text-xs font-bold tracking-wider text-slate-400">
              ARENAGG <span className="text-cyan-400">/</span> ADMIN
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Your esports command center
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                System Online
              </span>
            </div>

            <Link
              href="/admin/tournaments/new"
              className="admin-top-create"
            >
              <span className="text-lg">＋</span>
              <span className="hidden sm:inline">Create Tournament</span>
              <span className="sm:hidden">Create</span>
            </Link>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="admin-content mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
          <div className="min-w-0 animate-[arenaFadeUp_500ms_ease_both]">
            {children}
          </div>
        </div>

      </main>

    </div>
  );
}
