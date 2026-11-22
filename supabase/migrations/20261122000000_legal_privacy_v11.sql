-- ARENAGG legal documents v1.1: update accepted versions and privacy request categories.
-- Apply this migration in the production Supabase project before deploying the matching application.

alter table public.privacy_requests
  drop constraint if exists privacy_requests_request_type_check;
alter table public.privacy_requests
  add constraint privacy_requests_request_type_check
  check (request_type in ('access','correction','deletion','consent_withdrawal','grievance','parent_minor','other'));

-- Record affirmative acceptance of the legal documents for each registration.
-- Existing registrations remain valid; new registrations must include current versions.
alter table public.registrations
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_version text;

create or replace function public.register_team(p jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tournaments%rowtype;
  rid uuid;
  code text;
  m jsonb;
  n int;
  cname text;
begin
  select * into t from public.tournaments
  where id = (p->>'tournament_id')::uuid
  for update;

  if not found or t.status <> 'open' or t.starts_at <= now() then
    raise exception 'CLOSED';
  end if;

  if p->>'terms_accepted' <> 'true'
     or p->>'terms_version' <> '1.1'
     or p->>'privacy_version' <> '1.1' then
    raise exception 'LEGAL_ACCEPTANCE_REQUIRED';
  end if;

  select count(*) into n from public.registrations
  where tournament_id = t.id and status <> 'rejected';
  if n >= t.max_teams then raise exception 'FULL'; end if;

  if coalesce(jsonb_typeof(p->'teammates'), '') <> 'array' then
    raise exception 'TEAM_SIZE';
  end if;
  if jsonb_array_length(p->'teammates') <> t.team_size - 1 then
    raise exception 'TEAM_SIZE';
  end if;

  if nullif(trim(p->>'team_name'), '') is null
     or nullif(trim(p->>'captain_name'), '') is null
     or nullif(trim(p->>'captain_game_id'), '') is null
     or nullif(trim(p->>'captain_contact'), '') is null then
    raise exception 'INVALID_REGISTRATION';
  end if;

  loop
    code := 'AGG-' || upper(encode(gen_random_bytes(10), 'hex'));
    exit when not exists (select 1 from public.registrations where reg_code = code);
  end loop;

  insert into public.registrations
    (reg_code, tournament_id, team_name, captain_name, captain_contact,
     terms_accepted_at, terms_version, privacy_version)
  values
    (code, t.id, trim(p->>'team_name'), trim(p->>'captain_name'),
     trim(p->>'captain_contact'), now(), p->>'terms_version', p->>'privacy_version')
  returning id into rid;

  insert into public.registration_members
    (registration_id, tournament_id, name, gaming_id, role)
  values
    (rid, t.id, trim(p->>'captain_name'), trim(p->>'captain_game_id'), 'captain');

  for m in select value from jsonb_array_elements(p->'teammates') loop
    insert into public.registration_members
      (registration_id, tournament_id, name, gaming_id, role)
    values (rid, t.id, trim(m->>'name'), trim(m->>'game_id'), 'player');
  end loop;

  if jsonb_typeof(p->'substitute') = 'object' then
    if nullif(trim(p->'substitute'->>'name'), '') is null
       or nullif(trim(p->'substitute'->>'game_id'), '') is null then
      raise exception 'INVALID_REGISTRATION';
    end if;
    insert into public.registration_members
      (registration_id, tournament_id, name, gaming_id, role)
    values
      (rid, t.id, trim(p->'substitute'->>'name'),
       trim(p->'substitute'->>'game_id'), 'substitute');
  end if;

  return code;
exception when unique_violation then
  get stacked diagnostics cname = constraint_name;
  if cname = 'uq_reg_team' then
    raise exception 'DUPLICATE_TEAM';
  else
    raise exception 'DUPLICATE_ID';
  end if;
end
$$;

revoke execute on function public.register_team(jsonb) from public, anon, authenticated;
grant execute on function public.register_team(jsonb) to service_role;

