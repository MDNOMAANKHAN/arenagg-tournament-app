'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { istInputToIso, toLocalInput } from '@/lib/format';
export default function TournamentForm({ games, initial }: { games: { id: string; name: string }[]; initial?: any }) {
  const r = useRouter();
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) ?? '');
    try {
      const body = { game_id: g('game_id'), title: g('title'), description: g('description'), starts_at: istInputToIso(g('starts_at')), team_size: Number(g('team_size')), max_teams: Number(g('max_teams')), rules: g('rules'), status: g('status') };
      await adminApi('tournaments', initial ? 'PATCH' : 'POST', initial ? { id: initial.id, ...body } : body);
      r.push('/admin'); r.refresh();
    } catch (x: any) { setErr(x.message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card grid max-w-3xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="l">Game</label><select name="game_id" className="input" defaultValue={initial?.game_id}>{games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        <div><label className="l">Status</label><select name="status" className="input" defaultValue={initial?.status ?? 'draft'}>
          <option value="draft">Draft (hidden)</option><option value="open">Published · registrations open</option><option value="closed">Registrations closed</option><option value="live">Live</option><option value="completed">Completed</option></select></div>
        <div className="sm:col-span-2"><label className="l">Title</label><input name="title" className="input" required defaultValue={initial?.title} /></div>
        <div><label className="l">Date &amp; time</label><input type="datetime-local" name="starts_at" className="input" required defaultValue={toLocalInput(initial?.starts_at)} /></div>
        <div><label className="l">Team size (players per team, excl. substitute)</label><input type="number" min={1} max={10} name="team_size" className="input" required defaultValue={initial?.team_size ?? 4} /></div>
        <div><label className="l">Maximum teams</label><input type="number" min={2} max={500} name="max_teams" className="input" required defaultValue={initial?.max_teams ?? 12} /></div>
      </div>
      <div><label className="l">Short description</label><input name="description" className="input" maxLength={500} defaultValue={initial?.description} /></div>
      <div><label className="l">Rules</label><textarea name="rules" rows={7} className="input" maxLength={5000} defaultValue={initial?.rules} /></div>
      {err && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</div>}
      <div><button className="btn" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Create tournament'}</button></div>
    </form>
  );
}
