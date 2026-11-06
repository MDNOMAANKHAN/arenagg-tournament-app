
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { fmt } from '@/lib/format';
import RegActions from '@/components/RegActions';
import PaymentProofCell from '@/components/PaymentProofCell';

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
      'id,reg_code,team_name,captain_name,captain_contact,status,created_at,payment_status,payment_amount,payment_utr,payment_proof_path,registration_members(name,gaming_id,role)'
    )
    .eq('tournament_id', t.id)
    .order('created_at', { ascending: false });

  const q = (searchParams.q ?? '').trim().toLowerCase();

  const status = ['pending', 'approved', 'rejected'].includes(
    searchParams.status ?? ''
  )
    ? searchParams.status
    : '';

  const rows = (data ?? []).filter((r: any) => {
    const members = r.registration_members ?? [];

    return (
      (!status || r.status === status) &&
      (!q ||
        String(r.team_name ?? '').toLowerCase().includes(q) ||
        String(r.reg_code ?? '').toLowerCase().includes(q) ||
        String(r.captain_name ?? '').toLowerCase().includes(q) ||
        members.some((m: any) =>
          String(m.gaming_id ?? '').toLowerCase().includes(q)
        ))
    );
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

      {/* Page heading */}
      <div className="mb-7">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
        >
          <span>←</span>
          Dashboard
        </Link>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Tournament Management
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Registrations
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {t.title}
            <span className="mx-2 text-slate-600">·</span>
            {rows.length} registrations shown
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-6 grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">

        <form
          action=""
          method="GET"
          className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto_auto]"
        >
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q}
            className="input !w-full min-w-0 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
            placeholder="Search team, captain, gaming ID or code"
          />

          <select
            name="status"
            defaultValue={status}
            className="input !w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            type="submit"
            className="btn rounded-xl px-5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            Filter
          </button>

          <Link
            href={`/admin/tournaments/${t.id}/registrations`}
            className="btn light rounded-xl px-5 py-3 text-center transition-all duration-300 hover:border-cyan-400/40 hover:text-cyan-400"
          >
            Clear
          </Link>
        </form>

        <a
          href={`/api/admin/tournaments/${t.id}/export`}
          className="btn light flex items-center justify-center gap-2 rounded-xl px-5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:text-cyan-400"
        >
          <span>↓</span>
          Export CSV
        </a>
      </div>

      {/* Registrations table */}
      <section className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/20">

        {/* Table header information */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-white">
              Team Registrations
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review teams, player details and registration status.
            </p>
          </div>

          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
            {rows.length} Teams
          </span>
        </div>

        {/* Scrollable responsive table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-left">

            <colgroup>
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[17%]" />
              <col className="w-[14%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-white/10 bg-white/[0.035]">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Team
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Captain
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Players & Gaming IDs
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r: any) => (
                <tr
                  key={r.id}
                  className="border-b border-white/[0.06] transition-colors duration-200 hover:bg-cyan-400/[0.035] last:border-0"
                >
                  {/* Team */}
                  <td className="px-5 py-5 align-middle">
                    <div className="min-w-0">
                      <p className="break-words font-bold text-white">
                        {r.team_name}
                      </p>

                      <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
                        {r.reg_code}
                      </p>
                    </div>
                  </td>

                  {/* Captain */}
                  <td className="px-5 py-5 align-middle">
                    <p className="break-words font-semibold text-slate-200">
                      {r.captain_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {r.captain_contact}
                    </p>
                  </td>

                  {/* Players */}
                  <td className="px-5 py-5 align-middle">
                    <div className="grid gap-2">
                      {(r.registration_members ?? []).map(
                        (m: any, i: number) => (
                          <div
                            key={`${m.gaming_id}-${i}`}
                            className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                          >
                            <span className="font-medium text-slate-200">
                              {m.name}
                            </span>

                            <code className="break-all rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-xs text-cyan-300">
                              {m.gaming_id}
                            </code>

                            <span className="text-[10px] uppercase tracking-wider text-slate-500">
                              {m.role}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </td>

                  {/* Registration date */}
                  <td className="px-5 py-5 align-middle">
                    <span className="whitespace-nowrap text-sm text-slate-300">
                      {fmt(r.created_at)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-5 align-middle">
                    <span
                      className={`st ${TONE[r.status] ?? 'wait'} inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold capitalize`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-5 align-middle">
                    <PaymentProofCell
                      registrationId={r.id}
                      amount={r.payment_amount}
                      status={r.payment_status}
                      hasProof={!!r.payment_proof_path}
                      utr={r.payment_utr}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-5 align-middle">
                    <div className="min-w-[125px]">
                      <RegActions id={r.id} status={r.status} />
                    </div>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-slate-500">
                        <span>⌕</span>
                      </span>

                      <p className="font-semibold text-white">
                        No registrations found
                      </p>

                      <p className="text-sm text-slate-500">
                        Try changing your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] px-5 py-3 sm:px-6">
            <p className="text-xs text-slate-500">
              Showing {rows.length} registrations
            </p>

            <p className="text-xs text-slate-500">
              ARENAGG Admin Control Center
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
