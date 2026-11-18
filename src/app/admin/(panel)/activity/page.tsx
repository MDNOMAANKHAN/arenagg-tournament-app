import Link from 'next/link';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';

const LABEL: Record<string, string> = {
  tournament: 'Tournament',
  registration: 'Registration',
  match: 'Match',
  result: 'Result',
  privacy_request: 'Privacy request',
};

export default async function AdminActivityPage() {
  const a = (await getAdmin())!;
  const { data, error } = await a.sb
    .from('admin_activity')
    .select('id,action,entity_type,entity_id,summary,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-400 transition hover:text-cyan-300">← Dashboard</Link>
        <div className="mt-5">
          <div className="text-[10px] font-black tracking-[0.2em] text-cyan-300">ADMIN CONTROL CENTER</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Activity history</h1>
          <p className="mt-2 text-sm text-slate-400">A record of tournament, registration, match and result changes.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div><h2 className="font-bold text-white">Recent admin activity</h2><p className="mt-1 text-xs text-slate-500">Latest 100 events · newest first</p></div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">{data?.length ?? 0} events</span>
        </div>
        {error ? (
          <div className="p-6 text-sm text-amber-200">Activity log is not available yet. Apply the new Supabase migration, then refresh this page.</div>
        ) : !data?.length ? (
          <div className="p-8 text-center"><p className="font-semibold text-white">No activity recorded yet</p><p className="mt-1 text-sm text-slate-400">New admin changes will appear here after the audit migration is applied.</p></div>
        ) : (
          <ol className="divide-y divide-white/[0.07]">
            {data.map((event) => (
              <li key={event.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-200">{event.action}</span>
                  <div className="min-w-0"><p className="break-words text-sm font-semibold text-white">{LABEL[event.entity_type] ?? event.entity_type}: {event.summary}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{event.entity_id ?? 'Record ID unavailable'}</p></div>
                </div>
                <time className="shrink-0 text-xs text-slate-400">{fmt(event.created_at)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
