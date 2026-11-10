import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';
import RegActions from '@/components/RegActions';
import PaymentProofCell from '@/components/PaymentProofCell';

const TONE: Record<string, string> = { pending: 'wait', approved: 'ok', rejected: 'bad' };

export default async function Registrations({ params, searchParams }: {
  params: { id: string };
  searchParams: { q?: string; status?: string };
}) {
  const a = (await getAdmin())!;
  const { data: t } = await a.sb.from('tournaments').select('id,title').eq('id', params.id).maybeSingle();
  if (!t) notFound();

  const { data } = await a.sb.from('registrations')
    .select('id,reg_code,team_name,captain_name,captain_contact,status,created_at,payment_status,payment_amount,payment_utr,payment_proof_path,registration_members(name,gaming_id,role)')
    .eq('tournament_id', t.id).order('created_at', { ascending: false });

  const q = (searchParams.q ?? '').trim().toLowerCase();
  const status = ['pending', 'approved', 'rejected'].includes(searchParams.status ?? '') ? searchParams.status : '';
  const rows = (data ?? []).filter((r: any) => {
    const members = r.registration_members ?? [];
    return (!status || r.status === status) && (!q ||
      String(r.team_name ?? '').toLowerCase().includes(q) ||
      String(r.reg_code ?? '').toLowerCase().includes(q) ||
      String(r.captain_name ?? '').toLowerCase().includes(q) ||
      members.some((m: any) => String(m.gaming_id ?? '').toLowerCase().includes(q)));
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-3 py-6 sm:px-6 sm:py-8 xl:px-8">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300">← Dashboard</Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />Tournament management</div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Registrations</h1>
            <p className="mt-2 max-w-2xl truncate text-sm text-slate-400" title={t.title}>{t.title} <span className="mx-1.5 text-slate-600">/</span> {rows.length} {rows.length === 1 ? 'registration' : 'registrations'}</p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5">
            <span className="text-xl font-black tabular-nums text-white">{rows.length}</span><span className="text-xs font-semibold text-slate-400">Teams found</span>
          </div>
        </div>
      </div>

      <section className="mb-5 rounded-2xl border border-white/10 bg-slate-950/60 p-3 shadow-lg shadow-black/10 sm:p-4">
        <form action="" method="GET" className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_auto_auto]">
          <label className="min-w-0"><span className="sr-only">Search registrations</span><input type="search" name="q" defaultValue={searchParams.q} className="input !w-full min-w-0" placeholder="Search team, captain, gaming ID or code" /></label>
          <label className="min-w-0"><span className="sr-only">Filter by registration status</span><select name="status" defaultValue={status} className="input !w-full"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
          <button type="submit" className="btn min-w-[96px]">Apply filters</button>
          <Link href={`/admin/tournaments/${t.id}/registrations`} className="btn light min-w-[88px]">Reset</Link>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
          <p className="text-xs text-slate-500">Search by team, captain, registration code or player gaming ID.</p>
          <a href={`/api/admin/tournaments/${t.id}/export`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-bold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/10">↓ Export CSV</a>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/65 shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div><h2 className="font-bold text-white">Registered teams</h2><p className="mt-1 text-xs text-slate-500">Team information and submitted player details</p></div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300">{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All statuses'}</span>
        </div>

        {!rows.length ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl text-slate-500">⌕</span>
            <p className="font-semibold text-white">No registrations found</p><p className="mt-1 max-w-sm text-sm text-slate-500">Try another search term or clear the status filter.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:p-4 lg:hidden">
              {rows.map((r: any) => (
                <article key={r.id} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.07] p-4">
                    <div className="min-w-0 flex-1"><p className="break-words text-base font-bold text-white">{r.team_name || 'Unnamed team'}</p><p className="mt-1 break-all font-mono text-[11px] text-slate-500">{r.reg_code}</p></div>
                    <span className={`st ${TONE[r.status] ?? 'wait'}`}>{r.status}</span>
                  </div>
                  <div className="grid gap-4 p-4 sm:grid-cols-2">
                    <div className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Team captain</p><p className="break-words text-sm font-semibold text-slate-200">{r.captain_name || '—'}</p><p className="mt-1 break-all text-xs text-slate-400">{r.captain_contact || 'No contact provided'}</p></div>
                    <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered on</p><p className="text-sm text-slate-300">{fmt(r.created_at)}</p></div>
                  </div>
                  <div className="border-t border-white/[0.07] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Players</p><span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-semibold text-slate-400">{(r.registration_members ?? []).length} listed</span></div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(r.registration_members ?? []).map((m: any, i: number) => (
                        <div key={String(m.gaming_id ?? 'player') + '-' + i} className="min-w-0 rounded-lg border border-white/[0.07] bg-[#071326]/70 p-3">
                          <div className="flex min-w-0 items-start justify-between gap-2"><p className="min-w-0 break-words text-sm font-semibold text-slate-200">{m.name || 'Unnamed player'}</p>{m.role ? <span className="shrink-0 rounded-md bg-cyan-400/[0.08] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cyan-300">{m.role}</span> : null}</div>
                          <p className="mt-2 break-all font-mono text-xs text-cyan-200">{m.gaming_id || 'No gaming ID'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 border-t border-white/[0.07] p-4 sm:grid-cols-2">
                    <div className="min-w-0"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment information</p><PaymentProofCell registrationId={r.id} amount={r.payment_amount} status={r.payment_status} hasProof={!!r.payment_proof_path} utr={r.payment_utr} /></div>
                    <div className="min-w-0"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration actions</p><RegActions id={r.id} status={r.status} /></div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1180px] border-collapse text-left">
                <thead><tr className="border-b border-white/10 bg-white/[0.035]">
                  {['Team', 'Captain', 'Players & gaming IDs', 'Registered', 'Status', 'Payment', 'Actions'].map((label) => <th key={label} className="whitespace-nowrap px-4 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</th>)}
                </tr></thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id} className="border-b border-white/[0.06] align-top transition-colors last:border-0 hover:bg-cyan-400/[0.025]">
                      <td className="w-[14%] px-4 py-5"><p className="break-words text-sm font-bold text-white">{r.team_name || 'Unnamed team'}</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">{r.reg_code}</p></td>
                      <td className="w-[13%] px-4 py-5"><p className="break-words text-sm font-semibold text-slate-200">{r.captain_name || '—'}</p><p className="mt-1 break-all text-xs text-slate-500">{r.captain_contact || '—'}</p></td>
                      <td className="w-[25%] px-4 py-5"><div className="grid gap-2">{(r.registration_members ?? []).map((m: any, i: number) => (
                        <div key={String(m.gaming_id ?? 'player') + '-' + i} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                          <span className="min-w-0 break-words text-xs font-semibold text-slate-200">{m.name || 'Unnamed player'}</span>{m.role ? <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{m.role}</span> : null}
                          <code className="col-span-2 mt-1 break-all text-[11px] text-cyan-300">{m.gaming_id || 'No gaming ID'}</code>
                        </div>
                      ))}</div></td>
                      <td className="whitespace-nowrap px-4 py-5 text-xs text-slate-300">{fmt(r.created_at)}</td>
                      <td className="px-4 py-5"><span className={`st ${TONE[r.status] ?? 'wait'}`}>{r.status}</span></td>
                      <td className="min-w-[185px] px-4 py-5"><PaymentProofCell registrationId={r.id} amount={r.payment_amount} status={r.payment_status} hasProof={!!r.payment_proof_path} utr={r.payment_utr} /></td>
                      <td className="min-w-[185px] px-4 py-5"><RegActions id={r.id} status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3 sm:px-6">
          <p className="text-xs text-slate-500">Showing {rows.length} {rows.length === 1 ? 'registration' : 'registrations'}</p><p className="text-[10px] font-semibold tracking-wide text-slate-600">ARENAGG ADMIN</p>
        </div>
      </section>
    </main>
  );
}
