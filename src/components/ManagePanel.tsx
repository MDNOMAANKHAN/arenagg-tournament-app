'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { fmt, istInputToIso } from '@/lib/format';
type Row = { placement: string; points: string; kills: string };
export default function ManagePanel({ tid, matches, teams, results }: { tid: string; matches: any[]; teams: { id: string; team_name: string }[]; results: any[] }) {
  const r = useRouter();
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const init: Record<string, Row> = {};
  teams.forEach((t) => { const x = results.find((q) => q.registration_id === t.id); init[t.id] = { placement: x ? String(x.placement) : '', points: x ? String(x.points) : '0', kills: x ? String(x.kills) : '0' }; });
  const [rows, setRows] = useState(init);
  const [pub, setPub] = useState(results.some((x) => x.published));
  const run = async (fn: () => Promise<unknown>, ok = 'Saved') => { setBusy(true); setMsg(''); try { await fn(); setMsg(ok); r.refresh(); } catch (x: any) { setMsg('Error: ' + x.message); } setBusy(false); };
  const addMatch = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const g = (k: string) => String(f.get(k) ?? '');
    run(async () => { await adminApi('matches', 'POST', { tournament_id: tid, round_label: g('round_label'), match_no: Number(g('match_no')), scheduled_at: g('scheduled_at') ? istInputToIso(g('scheduled_at')) : null, status: g('status') }); form.reset(); }, 'Match added'); };
  const saveResults = () => run(async () => {
    // Save or clear each team's result. This also prevents stale results when an admin removes a placement.
    for (const t of teams) {
      const placement = rows[t.id].placement.trim();
      const existing = results.find((x) => x.registration_id === t.id);
      if (!placement) {
        if (existing) await adminApi('results', 'DELETE', undefined, `?id=${existing.id}`);
        continue;
      }
      const place = Number(placement), points = Number(rows[t.id].points || 0), kills = Number(rows[t.id].kills || 0);
      if (!Number.isInteger(place) || place < 1 || !Number.isInteger(points) || points < 0 || !Number.isInteger(kills) || kills < 0) throw new Error(`Invalid result values for ${t.team_name}`);
      await adminApi('results', 'POST', { tournament_id: tid, registration_id: t.id, placement: place, points, kills, published: pub });
    }
  }, pub ? 'Results saved and published' : 'Results saved (not public)');
  return (
    <div className="grid gap-6">
      {msg && <div className="rounded-xl bg-white p-3 text-sm font-semibold ring-1 ring-line" role="status">{msg}</div>}
      <section className="card"><h2 className="mb-3 text-xl">Matches</h2>
        <div className="overflow-x-auto"><table><thead><tr><th>#</th><th>Round</th><th>Scheduled</th><th>Status</th><th /></tr></thead><tbody>
          {matches.map((m) => (<tr key={m.id}><td>{m.match_no}</td><td><b>{m.round_label}</b></td><td>{m.scheduled_at ? fmt(m.scheduled_at) : '—'}</td>
            <td><select className="input !w-auto !py-1.5" defaultValue={m.status} onChange={(e) => run(() => adminApi('matches', 'PATCH', { id: m.id, status: e.target.value }), 'Match updated')}>{['scheduled', 'live', 'completed', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></td>
            <td><button className="btn sm danger" disabled={busy} onClick={() => confirm('Delete this match?') && run(() => adminApi('matches', 'DELETE', undefined, `?id=${m.id}`), 'Match deleted')}>Delete</button></td></tr>))}
          {!matches.length && <tr><td colSpan={5} className="text-muted">No matches yet.</td></tr>}
        </tbody></table></div>
        <form onSubmit={addMatch} className="mt-4 grid items-end gap-3 sm:grid-cols-5">
          <div><label className="l">Round</label><input name="round_label" className="input" required placeholder="Qualifier" /></div>
          <div><label className="l">Match no.</label><input name="match_no" type="number" min={1} defaultValue={matches.length + 1} className="input" required /></div>
          <div><label className="l">Date &amp; time</label><input name="scheduled_at" type="datetime-local" className="input" /></div>
          <div><label className="l">Status</label><select name="status" className="input"><option>scheduled</option><option>live</option><option>completed</option><option>cancelled</option></select></div>
          <button className="btn" disabled={busy}>Add match</button>
        </form></section>
      <section className="card"><h2 className="mb-1 text-xl">Results</h2><p className="mb-3 text-sm text-muted">Approved teams only. Leave placement blank to skip a team.</p>
        <div className="overflow-x-auto"><table><thead><tr><th>Team</th><th>Placement</th><th>Points</th><th>Kills</th></tr></thead><tbody>
          {teams.map((t) => (<tr key={t.id}><td><b>{t.team_name}</b></td>
            {(['placement', 'points', 'kills'] as const).map((k) => <td key={k}><input type="number" step="1" min={k === 'placement' ? 1 : 0} className="input !w-24 !py-1.5" value={rows[t.id][k]} onChange={(e) => setRows({ ...rows, [t.id]: { ...rows[t.id], [k]: e.target.value } })} /></td>)}</tr>))}
          {!teams.length && <tr><td colSpan={4} className="text-muted">Approve registrations first.</td></tr>}
        </tbody></table></div>
        <div className="mt-4 flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /> Publish results on the public site</label>
          <button className="btn" disabled={busy || !teams.length} onClick={saveResults}>Save results</button></div></section>
    </div>);
}
