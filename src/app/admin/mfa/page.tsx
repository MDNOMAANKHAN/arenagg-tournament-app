import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import MfaSetup from './MfaSetup';

export const dynamic = 'force-dynamic';

export default async function AdminMfaPage() {
  const admin = await getAdmin({ requireMfa: false });
  if (!admin) redirect('/admin/login');
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.08] blur-[120px]" />
      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Account security</p>
        <h1 className="mt-3 text-3xl font-black text-white">Secure your admin account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Authenticator verification is required before opening the admin workspace. Use an authenticator app and keep its recovery options safe.</p>
        <MfaSetup />
        <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">If you lose access to your authenticator, contact the platform owner to recover the admin account. Never share a one-time code with anyone.</p>
      </section>
    </main>
  );
}
