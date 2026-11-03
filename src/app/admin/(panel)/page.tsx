import Link from 'next/link';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';
const TONE: Record<string, string> = { draft: 'gray', open: 'ok', closed: 'wait', live: 'info', completed: 'gray' };
export default async function Dashboard() {
  const a = (await getAdmin())!;
  const { data } = await a.sb.from('tournaments').select('id,title,status,starts_at,max_teams,games(name),registrations(status)').order('starts_at', { ascending: false });
  const rows = (data ?? []).map((t: any) => ({ ...t, active: t.registrations.filter((r: any) => r.status !== 'rejected').length, pending: t.registrations.filter((r: any) => r.status === 'pending').length }));
  return (<div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-bold tracking-widest text-accd">TOURNAMENT OPERATIONS</div><h1 className="mt-1 text-3xl">Dashboard</h1></div><Link href="/admin/tournaments/new" className="btn">+ New tournament</Link></div>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      {[['TOURNAMENTS', rows.length], ['TEAMS REGISTERED', rows.reduce((n: number, r: any) => n + r.active, 0)], ['AWAITING APPROVAL', rows.reduce((n: number, r: any) => n + r.pending, 0)]].map(([k, v]) => <div key={k as string} className="card !p-5"><div className="text-[11px] font-bold tracking-widest text-muted">{k}</div><div className="mt-1.5 text-4xl font-extrabold">{v}</div></div>)}
    </div>
    <section className="card"><div className="overflow-x-auto"><table><thead><tr><th>Tournament</th><th>Starts</th><th>Teams</th><th>Status</th><th /></tr></thead><tbody>
      {rows.map((t: any) => (<tr key={t.id}><td><b>{t.title}</b><div className="text-xs text-muted">{t.games?.name}</div></td><td>{fmt(t.starts_at)}</td><td>{t.active} / {t.max_teams}{t.pending > 0 && <span className="st wait ml-2">{t.pending} pending</span>}</td><td><span className={`st ${TONE[t.status]}`}>{t.status}</span></td>
        <td><div className="flex flex-wrap gap-1.5"><Link className="btn sm light" href={`/admin/tournaments/${t.id}`}>Edit</Link><Link className="btn sm light" href={`/admin/tournaments/${t.id}/registrations`}>Registrations</Link><Link className="btn sm light" href={`/admin/tournaments/${t.id}/manage`}>Matches &amp; results</Link></div></td></tr>))}
      {!rows.length && <tr><td colSpan={5} className="text-muted">No tournaments yet. Create your first one.</td></tr>}
    </tbody></table></div></section></div>);
}
