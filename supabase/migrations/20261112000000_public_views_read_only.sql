-- Least-privilege permissions for public read-model views.
--
-- The public views are intended for display only. In particular,
-- registration_teams_public is a simple/updatable view over registrations.
-- Anonymous users previously had INSERT/UPDATE/DELETE/TRUNCATE grants on it,
-- which could bypass the base table's RLS policies through the view owner.
--
-- Keep public SELECT behaviour unchanged, but remove all write capabilities.
begin;

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

-- Anonymous visitors need to read published catalog data, not mutate the
-- underlying tables. Authenticated admin writes remain governed by existing
-- table grants and RLS policies.
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

commit;
