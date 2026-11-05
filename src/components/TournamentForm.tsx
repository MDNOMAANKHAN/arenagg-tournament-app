
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { istInputToIso, toLocalInput } from '@/lib/format';

export default function TournamentForm({
  games,
  initial,
}: {
  games: { id: string; name: string }[];
  initial?: any;
}) {
  const r = useRouter();

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setBusy(true);

    const fd = new FormData(e.currentTarget);

    const body = {
      game_id: String(fd.get('game_id') || ''),
      title: String(fd.get('title') || ''),
      description: String(fd.get('description') || ''),
      starts_at: istInputToIso(String(fd.get('starts_at') || '')),
      team_size: Number(fd.get('team_size') || 1),
      max_teams: Number(fd.get('max_teams') || 12),
      rules: String(fd.get('rules') || ''),
      status: String(fd.get('status') || 'open'),
    };

    try {
      await adminApi(
        'tournaments',
        initial ? 'PATCH' : 'POST',
        initial ? { ...body, id: initial.id } : body
      );

      r.push('/admin');
      r.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Unable to save tournament');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="card grid w-full max-w-3xl gap-5 p-4 sm:p-6"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="l mb-2 block">Game</label>
          <select
            name="game_id"
            className="input w-full"
            required
            defaultValue={initial?.game_id || ''}
          >
            <option value="">Select game</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="l mb-2 block">Status</label>
          <select
            name="status"
            className="input w-full"
            defaultValue={initial?.status || 'open'}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="l mb-2 block">Tournament title</label>
          <input
            name="title"
            className="input w-full"
            required
            defaultValue={initial?.title || ''}
            placeholder="Enter tournament name"
          />
        </div>

        <div>
          <label className="l mb-2 block">Start date & time</label>
          <input
            name="starts_at"
            type="datetime-local"
            className="input w-full"
            required
            defaultValue={initial?.starts_at ? toLocalInput(initial.starts_at) : ''}
          />
        </div>

        <div>
          <label className="l mb-2 block">Team size</label>
          <input
            name="team_size"
            type="number"
            min="1"
            max="10"
            className="input w-full"
            required
            defaultValue={initial?.team_size || 4}
          />
        </div>

        <div>
          <label className="l mb-2 block">Maximum teams</label>
          <input
            name="max_teams"
            type="number"
            min="2"
            max="100"
            className="input w-full"
            required
            defaultValue={initial?.max_teams || 12}
          />
        </div>
      </div>

      <div>
        <label className="l mb-2 block">Description</label>
        <textarea
          name="description"
          className="input w-full"
          rows={4}
          defaultValue={initial?.description || ''}
          placeholder="Tournament details"
        />
      </div>

      <div>
        <label className="l mb-2 block">Rules</label>
        <textarea
          name="rules"
          className="input w-full"
          rows={4}
          defaultValue={initial?.rules || ''}
          placeholder="Tournament rules"
        />
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
          {err}
        </div>
      )}

      {/* Premium submit button */}
      <button
        type="submit"
        className="arena-submit-button w-full"
        disabled={busy}
      >
        {busy
          ? 'Saving...'
          : initial
          ? 'Save Tournament'
          : '＋ Create Tournament'}
      </button>
    </form>
  );
}
