-- Fix pack 1: entry fee + cancelled tournaments.
--
-- 1. tournaments.entry_fee
--    The UI already reads `entry_fee` (src/lib/format.ts, the register page and
--    RegisterForm's UPI amount) but no column ever existed, so the value was
--    always undefined and the site silently fell back to a hardcoded ₹100 while
--    the tournament page advertised "Free". Adds the column and exposes it on
--    tournament_public.
--
-- 2. status = 'cancelled'
--    There was no way to cancel a tournament from the admin panel: the API only
--    allowed the five original statuses. Adds 'cancelled' to the check
--    constraint so the admin "Cancel tournament" action can store it.
--
-- 3. register_team() now records the expected amount on the registration
--    (registrations.payment_amount), so the admin sees what to collect.

alter table public.tournaments
  add column if not exists entry_fee int not null default 0;

alter table public.tournaments
  drop constraint if exists tournaments_entry_fee_check;

alter table public.tournaments
  add constraint tournaments_entry_fee_check
  check (entry_fee between 0 and 100000);

alter table public.tournaments
  drop constraint if exists tournaments_status_check;

alter table public.tournaments
  add constraint tournaments_status_check
  check (status in ('draft', 'open', 'closed', 'live', 'completed', 'cancelled'));

-- Recreate the public read model with the entry fee appended.
create or replace view public.tournament_public as
select t.id, t.title, t.description, t.starts_at, t.team_size, t.max_teams, t.rules, t.status,
       g.slug as game_slug, g.name as game_name,
       (select count(*) from public.registrations r where r.tournament_id = t.id and r.status <> 'rejected')::int as registered,
       t.entry_fee
from public.tournaments t join public.games g on g.id = t.game_id
where t.status <> 'draft';

grant select on public.tournament_public to anon, authenticated;

-- Same function as security_hardening, plus payment_amount, plus the
-- `extensions` schema on search_path so gen_random_bytes() resolves locally
-- and on cloud (pgcrypto lives in `extensions` there too).
create or replace function public.register_team(p jsonb) returns text
language plpgsql security definer set search_path = public, extensions as $$
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
  insert into public.registrations (reg_code, tournament_id, team_name, captain_name, captain_contact, payment_amount)
    values (code, t.id, trim(p->>'team_name'), trim(p->>'captain_name'), trim(p->>'captain_contact'), t.entry_fee) returning id into rid;
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

revoke execute on function public.register_team(jsonb) from public, anon, authenticated;
grant execute on function public.register_team(jsonb) to service_role;
