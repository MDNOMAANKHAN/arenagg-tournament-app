
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';
import RegActions from '@/components/RegActions';

const TONE: Record<string, string> = {
  pending: 'wait',
  approved: 'ok',
  rejected: 'bad',
};

export default async function Registrations({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { q?: string; status?: string };
}) {
  const a = (await getAdmin())!;

  const { data: t } = await a.sb
    .from('tournaments')
    .select('id,title')
    .eq('id', params.id)
    .maybeSingle();

  if (!t) notFound();

  const { data } = await a.sb
    .from('registrations')
    .select(
      'id,reg_code,team_name,captain_name,captain_contact,status,created_at,registration_members(name,gaming_id,role)'
    )
    .eq('tournament_id', t.id)
    .order('created_at', { ascending: false });

  const q = (searchParams.q ?? '').trim().toLowerCase();

  const status = ['pending', 'approved', 'rejected'].includes(
    searchParams.status ?? ''
  )
    ? searchParams.status
    : '';

  const rows = (data ?? []).filter(
    (r: any) =>
      (!status || r.status === status) &&
      (!q ||
        r.team_name.toLowerCase().includes(q) ||
        r.reg_code.toLowerCase().includes(q) ||
        r.captain_name.toLowerCase().includes(q) ||
        r.registration_members.some((m: any) =>
          m.gaming_id.toLowerCase().includes(q)
        ))
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm text-muted">
        ← Dashboard
      </Link>

      <div className="mb-6 mt-3">
        <h1 className="text-3xl font-bold">Registrations</h1>
        <p className="mt-2 text-muted">
          {t.title} · {rows.length} shown
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form className="flex w-full flex-wrap items-center gap-2 lg:flex-1">
          <input
            name="q"
            defaultValue={searchParams.q}
            className="input min-w-0 flex-1"
            placeholder="Search team, captain, gaming ID or code"
          />

          <select
            name="status"
            defaultValue={status}
            className="input !w-auto"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="btn">Filter</button>

          <Link
            href={`/admin/tournaments/${t.id}/registrations`}
            className="btn light"
          >
            Clear
          </Link>
        </form>

        <a
          href={`/api/admin/tournaments/${t.id}/export`}
          className="btn light"
        >
          Export CSV ↓
        </a>
      </div>

      <section className="card w-full">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Team</th>
                <th>Captain</th>
                <th>Players &amp; gaming IDs</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.team_name}</b>
                    <div className="text-xs text-muted">
                      {r.reg_code}
                    </div>
                  </td>

                  <td>
                    {r.captain_name}
                    <div className="text-xs text-muted">
                      {r.captain_contact}
                    </div>
                  </td>

                  <td>
                    {r.registration_members.map((m: any) => (
                      <div key={m.gaming_id}>
                        {m.name} · <code>{m.gaming_id}</code>{' '}
                        <span className="text-xs text-muted">
                          ({m.role})
                        </span>
                      </div>
                    ))}
                  </td>

                  <td>{fmt(r.created_at)}</td>

                  <td>
                    <span className={`st ${TONE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>

                  <td>
                    <RegActions id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
