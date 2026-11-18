import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';
import PrivacyRequestActions from './PrivacyRequestActions';

export const dynamic = 'force-dynamic';

export default async function PrivacyRequestsAdminPage() {
  const admin = (await getAdmin())!;
  const { data, error } = await admin.sb.from('privacy_requests')
    .select('id,request_type,requester_name,contact,registration_code,details,status,admin_notes,created_at,reviewed_at')
    .order('created_at', { ascending: false }).limit(100);
  return (
    <div className="space-y-6">
      <div><p className="text-[10px] font-black tracking-[0.2em] text-cyan-300">ADMIN CONTROL CENTER</p><h1 className="mt-2 text-3xl font-black text-white">Privacy requests</h1><p className="mt-2 text-sm text-slate-400">Verify identity and authority before disclosing, correcting or deleting personal information.</p></div>
      {error ? <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Apply the privacy-request migration in Supabase, then refresh this page.</p> : !data?.length ? <p className="rounded-xl border border-white/10 p-6 text-sm text-slate-400">No privacy requests have been submitted.</p> : (
        <div className="grid gap-4">{data.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-white">{item.request_type.toUpperCase()} · {item.requester_name}</h2><span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-200">{item.status.replace('_',' ')}</span></div>
            <p className="mt-2 break-all text-sm text-slate-300">{item.contact}</p>
            {item.registration_code && <p className="mt-1 font-mono text-xs text-slate-500">{item.registration_code}</p>}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.details}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span>Received: {fmt(item.created_at)}</span>{item.reviewed_at && <span>Reviewed: {fmt(item.reviewed_at)}</span>}<span className="font-mono">Ref: {item.id}</span></div>
            <PrivacyRequestActions id={item.id} status={item.status} notes={item.admin_notes} />
          </article>
        ))}</div>
      )}
      <p className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs leading-6 text-amber-100/80">Before completing a request, verify the requester through the registered contact channel and record the verification method and retention assessment in internal notes. Do not delete records while a legal hold, payment dispute or statutory retention duty applies.</p>
    </div>
  );
}
