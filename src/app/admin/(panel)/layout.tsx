import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import SignOut from '@/components/SignOut';
export const dynamic = 'force-dynamic';
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const a = await getAdmin();
  if (!a) redirect('/admin/login?denied=1');
  return (<div className="flex min-h-screen flex-wrap">
    <aside className="w-full bg-ink p-5 text-white md:w-60">
      <Link href="/admin" className="text-[22px] font-extrabold tracking-tight">ARENA<span className="text-[#60A5FA]">GG</span></Link>
      <div className="mb-6 mt-1 text-[11px] font-bold tracking-widest text-[#7E90B3]">ADMIN · PRIVATE</div>
      <nav className="grid gap-1 text-sm font-semibold"><Link className="rounded-[10px] bg-white/10 px-3.5 py-2.5" href="/admin">Dashboard</Link><Link className="rounded-[10px] px-3.5 py-2.5 text-[#9FB0D0] hover:bg-white/5" href="/admin/tournaments/new">New tournament</Link><Link className="rounded-[10px] px-3.5 py-2.5 text-[#9FB0D0] hover:bg-white/5" href="/" target="_blank">Public site ↗</Link></nav>
      <div className="mt-8 break-all text-xs text-[#9FB0D0]">{a.user.email}<br />Role: {a.role}</div><div className="mt-3"><SignOut /></div>
    </aside>
    <main className="min-w-0 flex-1 p-6 md:p-9">{children}</main></div>);
}
