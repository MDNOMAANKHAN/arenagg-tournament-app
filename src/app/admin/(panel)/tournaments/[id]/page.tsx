import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import TournamentForm from '@/components/TournamentForm';
export default async function EditTournament({ params }: { params: { id: string } }) {
  const a = (await getAdmin())!;
  const { data: games } = await a.sb.from('games').select('id,name').order('name');
  let initial = null;
  if (params.id !== 'new') { const { data } = await a.sb.from('tournaments').select('*').eq('id', params.id).maybeSingle(); if (!data) notFound(); initial = data; }
  return (<div><h1 className="mb-5 text-3xl">{initial ? 'Edit tournament' : 'New tournament'}</h1><TournamentForm games={games ?? []} initial={initial} /></div>);
}
