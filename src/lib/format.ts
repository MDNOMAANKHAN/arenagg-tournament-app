export const GAME_COLOR: Record<string, string> = { 'free-fire-max': '#EA580C', bgmi: '#CA8A04', valorant: '#DC2626' };
export const gameColor = (slug: string) => GAME_COLOR[slug] ?? '#2563EB';
export const fmt = (d: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(d)) + ' IST';
// datetime-local fields are intentionally displayed and interpreted in India Standard Time,
// regardless of the server's or administrator's machine timezone.
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};
export const istInputToIso = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Enter a valid date and time.');
  const d = new Date(`${value}:00+05:30`);
  if (Number.isNaN(d.getTime())) throw new Error('Enter a valid date and time.');
  return d.toISOString();
};
export interface PublicTournament { id: string; title: string; description: string | null; starts_at: string; team_size: number; max_teams: number; rules: string | null; status: string; game_slug: string; game_name: string; registered: number }
export function slotInfo(t: PublicTournament) {
  const left = Math.max(t.max_teams - t.registered, 0);
  const canRegister = t.status === 'open' && left > 0 && new Date(t.starts_at) > new Date();
  const label = t.status === 'live' ? 'Live'
    : t.status === 'completed' ? 'Completed'
    : t.status === 'open' && left <= 0 ? 'Full'
    : t.status === 'open' && new Date(t.starts_at) <= new Date() ? 'Registration closed'
    : canRegister ? `${left} slot${left === 1 ? '' : 's'} left`
    : 'Registration closed';
  return { left, canRegister, label, pct: Math.min(100, Math.round((t.registered / t.max_teams) * 100)) };
}
