-- Reduce personal information collected in new registrations.
-- Existing historical records are intentionally not deleted by this migration.
-- New registrations collect a captain contact phone, gaming IDs, an optional
-- team nickname, and a payment UTR for paid events; no names or screenshots.

alter table public.registrations
  alter column captain_name drop not null;

alter table public.registration_members
  alter column name drop not null;

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
  team_label text;
  utr text;
begin
  select * into t
  from public.tournaments
  where id = (p->>'tournament_id')::uuid
  for update;

  if not found or t.status <> 'open' or t.starts_at <= now() then
    raise exception 'CLOSED';
  end if;

  if p->>'terms_accepted' <> 'true'
     or p->>'terms_version' <> '1.2'
     or p->>'privacy_version' <> '1.2' then
    raise exception 'LEGAL_ACCEPTANCE_REQUIRED';
  end if;

  select count(*) into n
  from public.registrations
  where tournament_id = t.id and status <> 'rejected';
  if n >= t.max_teams then raise exception 'FULL'; end if;

  if coalesce(jsonb_typeof(p->'teammates'), '') <> 'array'
     or jsonb_array_length(p->'teammates') <> t.team_size - 1 then
    raise exception 'TEAM_SIZE';
  end if;

  if nullif(trim(p->>'captain_game_id'), '') is null
     or nullif(trim(p->>'captain_contact'), '') is null then
    raise exception 'INVALID_REGISTRATION';
  end if;

  utr := nullif(trim(p->>'payment_utr'), '');
  if t.entry_fee > 0 and utr is null then
    raise exception 'PAYMENT_REFERENCE_REQUIRED';
  end if;

  loop
    code := 'AGG-' || upper(encode(gen_random_bytes(10), 'hex'));
    exit when not exists (select 1 from public.registrations where reg_code = code);
  end loop;

  team_label := coalesce(nullif(trim(p->>'team_name'), ''), 'Team ' || right(code, 8));

  insert into public.registrations
    (reg_code, tournament_id, team_name, captain_name, captain_contact,
     payment_utr, payment_amount, payment_submitted_at,
     terms_accepted_at, terms_version, privacy_version)
  values
    (code, t.id, team_label, null, trim(p->>'captain_contact'),
     utr, case when t.entry_fee > 0 then t.entry_fee else null end,
     case when utr is not null then now() else null end,
     now(), p->>'terms_version', p->>'privacy_version')
  returning id into rid;

  insert into public.registration_members
    (registration_id, tournament_id, name, gaming_id, role)
  values
    (rid, t.id, null, trim(p->>'captain_game_id'), 'captain');

  for m in select value from jsonb_array_elements(p->'teammates') loop
    if nullif(trim(m->>'game_id'), '') is null then
      raise exception 'INVALID_REGISTRATION';
    end if;
    insert into public.registration_members
      (registration_id, tournament_id, name, gaming_id, role)
    values (rid, t.id, null, trim(m->>'game_id'), 'player');
  end loop;

  if jsonb_typeof(p->'substitute') = 'object' then
    if nullif(trim(p->'substitute'->>'game_id'), '') is null then
      raise exception 'INVALID_REGISTRATION';
    end if;
    insert into public.registration_members
      (registration_id, tournament_id, name, gaming_id, role)
    values
      (rid, t.id, null, trim(p->'substitute'->>'game_id'), 'substitute');
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
