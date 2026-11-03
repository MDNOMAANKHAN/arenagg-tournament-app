import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import ManagePanel from '@/components/ManagePanel';
export default async function Manage({ params }: { params: { id: string } }) {
  const a = (await getAdmin())!;
  const { data: t } = await a.sb.from('tournaments').select('id,title').eq('id', params.id).maybeSingle();
  if (!t) notFound();
  const [{ data: matches }, { data: teams }, { data: results }] = await Promise.all([
    a.sb.from('matches').select('*').eq('tournament_id', t.id).order('match_no'),
    a.sb.from('registrations').select('id,team_name').eq('tournament_id', t.id).eq('status', 'approved').order('team_name'),
    a.sb.from('tournament_results').select('*').eq('tournament_id', t.id),
  ]);
  return (<div><Link href="/admin" className="text-sm text-muted">← Dashboard</Link><h1 className="mb-5 mt-1 text-3xl">Matches &amp; results · {t.title}</h1>
    <ManagePanel tid={t.id} matches={matches ?? []} teams={teams ?? []} results={results ?? []} /></div>);
}
