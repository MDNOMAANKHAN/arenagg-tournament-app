-- Harden ARENAGG public read models and admin policy helpers.
--
-- The public views are intended for display only. registration_teams_public
-- is a simple view over registrations and was granted anonymous write access.
-- Convert all public views to security-invoker views, expose only the specific
-- registration/result columns required by those views, and apply matching RLS.
--
-- Admin-only RLS policies are scoped to authenticated users. The helper
-- functions become SECURITY INVOKER and are executable only by authenticated
-- users, so they evaluate the current user's own admin row under admins_self.
begin;

-- 1) Public read models must run with the caller's permissions and RLS.
alter view public.tournament_public set (security_invoker = true);
alter view public.results_public set (security_invoker = true);
alter view public.registration_teams_public set (security_invoker = true);

-- The public tournament and team pages only need these registration fields.
-- Do not grant anonymous access to captain contacts, UTRs, proof paths, or
-- registration codes.
grant select (id, tournament_id, team_name, status)
  on public.registrations to anon, authenticated;

-- Published result rows only; the RLS policy below limits these columns to
-- results whose registration is approved.
grant select (tournament_id, registration_id, placement, points, kills, published)
  on public.tournament_results to anon, authenticated;

drop policy if exists reg_public_teams_read on public.registrations;
create policy reg_public_teams_read
  on public.registrations for select to anon, authenticated
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = registrations.tournament_id
        and t.status <> 'draft'
    )
  );

drop policy if exists res_public_read on public.tournament_results;
create policy res_public_read
  on public.tournament_results for select to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.registrations r
      where r.id = tournament_results.registration_id
        and r.status = 'approved'
    )
  );

-- Public views are read-only. Revoke inherited/default write grants as well as
-- explicit role grants, then restore SELECT only.
revoke all privileges on table
  public.registration_teams_public,
  public.results_public,
  public.tournament_public
from public, anon, authenticated;

grant select on table
  public.registration_teams_public,
  public.results_public,
  public.tournament_public
to anon, authenticated;

-- Anonymous visitors can read the public catalog but cannot mutate base rows.
revoke all privileges on table
  public.games,
  public.matches,
  public.tournaments
from anon;

grant select on table
  public.games,
  public.matches,
  public.tournaments
to anon;

-- The only Storage bucket is private and all object operations are routed
-- through server-side service-role handlers. No browser role needs direct
-- access to storage.objects.
revoke all privileges on table storage.objects from public, anon, authenticated;

-- 2) Restrict admin policies to signed-in users. Public visitors should only
-- evaluate the explicit public-read policies, not admin helper functions.
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists games_super on public.games;
create policy games_super on public.games
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists t_admin_read on public.tournaments;
create policy t_admin_read on public.tournaments
  for select to authenticated
  using (public.is_admin());

drop policy if exists t_admin_ins on public.tournaments;
create policy t_admin_ins on public.tournaments
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists t_admin_upd on public.tournaments;
create policy t_admin_upd on public.tournaments
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists t_super_del on public.tournaments;
create policy t_super_del on public.tournaments
  for delete to authenticated
  using (public.is_super_admin());

drop policy if exists reg_admin_read on public.registrations;
create policy reg_admin_read on public.registrations
  for select to authenticated
  using (public.is_admin());

drop policy if exists reg_admin_upd on public.registrations;
create policy reg_admin_upd on public.registrations
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists mem_admin_read on public.registration_members;
create policy mem_admin_read on public.registration_members
  for select to authenticated
  using (public.is_admin());

drop policy if exists m_admin on public.matches;
create policy m_admin on public.matches
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists res_admin on public.tournament_results;
create policy res_admin on public.tournament_results
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3) These helpers are evaluated under the caller's privileges. admins_self
-- lets an authenticated user read only their own admin row, preventing a
-- SECURITY DEFINER helper from bypassing that policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  )
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid() and role = 'super_admin'
  )
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_super_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- Keep the service-role-only SECURITY DEFINER RPCs pinned to trusted
-- schemas. pg_catalog is first so built-ins cannot be shadowed.
alter function public.register_team(jsonb)
  set search_path = pg_catalog, public, extensions;
alter function public.check_rate_limit(text, integer, integer)
  set search_path = pg_catalog, public, extensions;
alter function public.get_registration_public(text)
  set search_path = pg_catalog, public, extensions;

revoke all on function public.register_team(jsonb) from public, anon, authenticated;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.get_registration_public(text) from public, anon, authenticated;
grant execute on function public.register_team(jsonb) to service_role;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
grant execute on function public.get_registration_public(text) to service_role;

-- Trigger functions do not need to be callable through the Data API.
create or replace function public.sync_members_active()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.registration_members
  set active = (new.status <> 'rejected')
  where registration_id = new.id;
  return new;
end
$$;

revoke all on function public.sync_members_active() from public, anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;

commit;
