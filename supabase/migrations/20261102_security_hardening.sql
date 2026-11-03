-- ARENAGG security hardening migration.
-- Review and run once in Supabase SQL Editor for an existing installation.
-- New installations should run the updated supabase/schema.sql instead.

create or replace function public.register_team(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  t public.tournaments%rowtype;
  rid uuid;
  code text;
  m jsonb;
  n int;
  cname text;
begin
  select * into t from public.tournaments where id = (p->>'tournament_id')::uuid for update;
  if not found or t.status <> 'open' or t.starts_at <= now() then raise exception 'CLOSED'; end if;
  select count(*) into n from public.registrations where tournament_id = t.id and status <> 'rejected';
  if n >= t.max_teams then raise exception 'FULL'; end if;
  if coalesce(jsonb_typeof(p->'teammates'), '') <> 'array' then raise exception 'TEAM_SIZE'; end if;
  if jsonb_array_length(p->'teammates') <> t.team_size - 1 then raise exception 'TEAM_SIZE'; end if;
  if nullif(trim(p->>'team_name'), '') is null or nullif(trim(p->>'captain_name'), '') is null
     or nullif(trim(p->>'captain_game_id'), '') is null or nullif(trim(p->>'captain_contact'), '') is null then
    raise exception 'INVALID_REGISTRATION';
  end if;
  loop
    code := 'AGG-' || upper(encode(gen_random_bytes(10), 'hex'));
    exit when not exists (select 1 from public.registrations where reg_code = code);
  end loop;
  insert into public.registrations (reg_code, tournament_id, team_name, captain_name, captain_contact)
    values (code, t.id, trim(p->>'team_name'), trim(p->>'captain_name'), trim(p->>'captain_contact')) returning id into rid;
  insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
    values (rid, t.id, trim(p->>'captain_name'), trim(p->>'captain_game_id'), 'captain');
  for m in select value from jsonb_array_elements(p->'teammates') loop
    insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
      values (rid, t.id, trim(m->>'name'), trim(m->>'game_id'), 'player');
  end loop;
  if jsonb_typeof(p->'substitute') = 'object' then
    if nullif(trim(p->'substitute'->>'name'), '') is null or nullif(trim(p->'substitute'->>'game_id'), '') is null then
      raise exception 'INVALID_REGISTRATION';
    end if;
    insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
      values (rid, t.id, trim(p->'substitute'->>'name'), trim(p->'substitute'->>'game_id'), 'substitute');
  end if;
  return code;
exception when unique_violation then
  get stacked diagnostics cname = constraint_name;
  if cname = 'uq_reg_team' then raise exception 'DUPLICATE_TEAM'; else raise exception 'DUPLICATE_ID'; end if;
end $$;

create or replace function public.get_registration_public(p_code text)
returns table (team_name text, status text, tournament_title text, game_name text, starts_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.team_name, r.status, t.title, g.name, t.starts_at, r.created_at
  from public.registrations r
  join public.tournaments t on t.id = r.tournament_id
  join public.games g on g.id = t.game_id
  where r.reg_code = upper(p_code) and p_code ~* '^AGG-[0-9A-F]{20}$'
$$;

-- Existing 8-character codes remain in the database but are no longer accepted
-- by the public confirmation page. Contact the organizer if an old code is needed.

create or replace view public.results_public as
select tr.tournament_id, t.title, g.name as game_name, g.slug as game_slug,
       r.team_name, tr.placement, tr.points, tr.kills
from public.tournament_results tr
join public.tournaments t on t.id = tr.tournament_id
join public.games g on g.id = t.game_id
join public.registrations r on r.id = tr.registration_id
where tr.published and r.status = 'approved';

revoke execute on function public.get_registration_public(text) from public, anon, authenticated;
grant execute on function public.get_registration_public(text) to service_role;
