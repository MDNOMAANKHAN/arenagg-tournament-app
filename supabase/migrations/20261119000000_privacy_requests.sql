-- Restricted privacy-rights request intake and auditable admin review.
create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('access','correction','deletion','other')),
  requester_name text not null check (length(trim(requester_name)) between 2 and 100),
  contact text not null check (length(trim(contact)) between 5 and 120),
  registration_code text,
  details text not null check (length(trim(details)) between 10 and 2000),
  status text not null default 'pending'
    check (status in ('pending','identity_verification','in_review','completed','declined')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists privacy_requests_created_at_idx
  on public.privacy_requests (created_at desc);
alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from public, anon, authenticated;
grant select, update on public.privacy_requests to authenticated;
create policy privacy_requests_admin_read on public.privacy_requests
  for select to authenticated using (public.is_admin());
create policy privacy_requests_admin_update on public.privacy_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Extend the existing audit entity allow-list and record request review actions.
alter table public.admin_activity
  drop constraint if exists admin_activity_entity_type_check;
alter table public.admin_activity
  add constraint admin_activity_entity_type_check
  check (entity_type in ('tournament','registration','match','result','privacy_request'));

create or replace function public.log_admin_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $
declare
  row_data jsonb;
  entity text;
  summary_text text;
begin
  row_data := case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end;
  entity := case TG_TABLE_NAME
    when 'tournaments' then 'tournament'
    when 'registrations' then 'registration'
    when 'matches' then 'match'
    when 'tournament_results' then 'result'
    when 'privacy_requests' then 'privacy_request'
    else TG_TABLE_NAME
  end;
  summary_text := coalesce(
    row_data->>'title',
    row_data->>'team_name',
    row_data->>'request_type',
    row_data->>'round_label',
    case when row_data ? 'registration_id' then 'Tournament result' end,
    initcap(entity)
  );
  insert into public.admin_activity(actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), TG_OP, entity, nullif(row_data->>'id', '')::uuid, summary_text);
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create or replace function public.touch_privacy_request_updated_at()
returns trigger language plpgsql set search_path = pg_catalog
as $$
begin
  new.updated_at = pg_catalog.now();
  if new.status is distinct from old.status then
    new.reviewed_at = pg_catalog.now();
  end if;
  return new;
end
$$;

drop trigger if exists privacy_requests_touch_updated_at on public.privacy_requests;
create trigger privacy_requests_touch_updated_at
before update on public.privacy_requests
for each row execute function public.touch_privacy_request_updated_at();

drop trigger if exists audit_privacy_requests on public.privacy_requests;
create trigger audit_privacy_requests
after insert or update or delete on public.privacy_requests
for each row execute function public.log_admin_activity();

revoke all on function public.touch_privacy_request_updated_at() from public, anon, authenticated;
