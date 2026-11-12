import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';
import { tournamentSchema, matchSchema, resultSchema, regStatusSchema } from '@/lib/validation';

type Cfg = { table: string; create?: z.ZodTypeAny; update?: z.ZodTypeAny; remove?: boolean; conflict?: string };
const R: Record<string, Cfg> = {
  tournaments: { table: 'tournaments', create: tournamentSchema, update: tournamentSchema.partial() },
  registrations: { table: 'registrations', update: regStatusSchema },
  matches: { table: 'matches', create: matchSchema, update: matchSchema.partial(), remove: true },
  results: { table: 'tournament_results', create: resultSchema, conflict: 'tournament_id,registration_id', remove: true },
};
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function handle(req: NextRequest, resource: string, op: 'create' | 'update' | 'remove') {
  // Admin mutations use cookie-based sessions, so fail closed if the browser
  // does not send an Origin header. This blocks cross-site form/fetch requests
  // from reaching state-changing endpoints.
  const origin = req.headers.get('origin');
  if (!origin) return bad('Forbidden', 403);
  try {
    if (new URL(origin).origin !== new URL(req.url).origin) {
      return bad('Forbidden', 403);
    }
  } catch {
    return bad('Forbidden', 403);
  }
  const admin = await getAdmin();                       // server-side permission check on every call
  if (!admin) return bad('Forbidden', 403);
  const cfg = R[resource];
  if (!cfg || (op === 'remove' ? !cfg.remove : !cfg[op])) return bad('Not allowed', 405);
  const uuid = z.string().uuid();

  if (op === 'remove') {
    const id = uuid.safeParse(req.nextUrl.searchParams.get('id'));
    if (!id.success) return bad('Invalid id');
    const { data, error } = await admin.sb.from(cfg.table).delete().eq('id', id.data).select('id');
    if (error) { console.error('Admin delete failed', resource, error.message); return bad('Could not complete this action. Please try again.'); }
    return data?.length ? NextResponse.json({ ok: true }) : bad('Not found or not permitted', 404);
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Invalid body');

  if (op === 'create') {
    const p = cfg.create!.safeParse(body);
    if (!p.success) return bad(p.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), 422);
    if (resource === 'results') {
      const result = p.data as z.infer<typeof resultSchema>;
      const { data: registration, error: registrationError } = await admin.sb.from('registrations').select('id').eq('id', result.registration_id).eq('tournament_id', result.tournament_id).eq('status', 'approved').maybeSingle();
      if (registrationError || !registration) return bad('Results can only be recorded for an approved team in this tournament.', 422);
    }
    const row = resource === 'tournaments' ? { ...p.data, created_by: admin.user.id } : p.data;
    const q = cfg.conflict ? admin.sb.from(cfg.table).upsert(row, { onConflict: cfg.conflict }) : admin.sb.from(cfg.table).insert(row);
    const { data, error } = await q.select('id').single();
    if (error) { console.error('Admin create failed', resource, error.message); return bad('Could not save this item. Check the fields and try again.', 422); }
    return NextResponse.json({ id: data.id }, { status: 201 });
  }
  const { id, ...rest } = body as Record<string, unknown>;
  const pid = uuid.safeParse(id);
  const p = cfg.update!.safeParse(rest);
  if (!pid.success || !p.success) return bad('Invalid input', 422);
  if (resource === 'tournaments') {
    const { data: current, error: currentError } = await admin.sb.from('tournaments').select('game_id,team_size').eq('id', pid.data).maybeSingle();
    if (currentError || !current) return bad('Tournament not found or could not be checked.', 404);
    const { count, error: countError } = await admin.sb.from('registrations').select('id', { count: 'exact', head: true }).eq('tournament_id', pid.data).neq('status', 'rejected');
    if (countError) { console.error('Could not verify tournament registrations', countError.message); return bad('Could not verify current registrations. Please retry.'); }
    const activeCount = count ?? 0;
    const incoming = p.data as Partial<z.infer<typeof tournamentSchema>>;
    if (typeof incoming.max_teams === 'number' && incoming.max_teams < activeCount) return bad(`Maximum teams cannot be lower than the ${activeCount} existing active registrations.`, 422);
    if (activeCount > 0 && ((incoming.team_size !== undefined && incoming.team_size !== current.team_size) || (incoming.game_id !== undefined && incoming.game_id !== current.game_id))) {
      return bad('Game and team size cannot be changed after registrations exist. Create a new tournament instead.', 422);
    }
  }
  if (resource === 'matches' && Object.prototype.hasOwnProperty.call(rest, 'tournament_id')) return bad('A match cannot be moved to another tournament.', 422);
  const { data, error } = await admin.sb.from(cfg.table).update(p.data).eq('id', pid.data).select('id');
  if (error) { console.error('Admin update failed', resource, error.message); return bad('Could not update this item. Please try again.'); }
  return data?.length ? NextResponse.json({ ok: true }) : bad('Not found or not permitted', 404);
}
type Ctx = { params: { resource: string } };
export const POST = (r: NextRequest, c: Ctx) => handle(r, c.params.resource, 'create');
export const PATCH = (r: NextRequest, c: Ctx) => handle(r, c.params.resource, 'update');
export const DELETE = (r: NextRequest, c: Ctx) => handle(r, c.params.resource, 'remove');
