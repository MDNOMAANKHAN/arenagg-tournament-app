-- Minimal admin audit trail. Stores identifiers and operational summaries only;
-- it deliberately excludes captain contact details, payment references and player IDs.
create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  entity_type text not null check (entity_type in ('tournament','registration','match','result')),
  entity_id uuid,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_created_at_idx
  on public.admin_activity (created_at desc);
create index if not exists admin_activity_entity_idx
  on public.admin_activity (entity_type, entity_id);

alter table public.admin_activity enable row level security;
revoke all on public.admin_activity from anon, authenticated;
grant select on public.admin_activity to authenticated;
create policy admin_activity_read on public.admin_activity
  for select to authenticated using (public.is_admin());

create or replace function public.log_admin_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
    else TG_TABLE_NAME
  end;
  summary_text := coalesce(
    row_data->>'title',
    row_data->>'team_name',
    row_data->>'round_label',
    case when row_data ? 'registration_id' then 'Tournament result' end,
    initcap(entity)
  );

  insert into public.admin_activity(actor_id, action, entity_type, entity_id, summary)
  values (
    auth.uid(),
    TG_OP,
    entity,
    nullif(row_data->>'id', '')::uuid,
    summary_text
  );

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

drop trigger if exists audit_tournaments on public.tournaments;
create trigger audit_tournaments after insert or update or delete on public.tournaments
  for each row execute function public.log_admin_activity();
drop trigger if exists audit_registrations on public.registrations;
create trigger audit_registrations after insert or update or delete on public.registrations
  for each row execute function public.log_admin_activity();
drop trigger if exists audit_matches on public.matches;
create trigger audit_matches after insert or update or delete on public.matches
  for each row execute function public.log_admin_activity();
drop trigger if exists audit_results on public.tournament_results;
create trigger audit_results after insert or update or delete on public.tournament_results
  for each row execute function public.log_admin_activity();

revoke all on function public.log_admin_activity() from public, anon, authenticated;
