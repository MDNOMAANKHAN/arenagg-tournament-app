-- Local dev stand-in for a view the app uses but the repo schema never defines.
--
-- src/app/(site)/tournaments/[id]/page.tsx queries
--   sb.from('registration_teams_public').select('team_name,status')
-- but neither supabase/schema.sql nor any migration creates it, so the public
-- tournament page always renders "Team status is temporarily unavailable."
--
-- The deployed project must already have this view (otherwise that page is
-- broken in production too). It is recreated here so local dev matches.
-- The real fix belongs in supabase/schema.sql.

create or replace view public.registration_teams_public as
select r.tournament_id, r.team_name, r.status
from public.registrations r
where exists (
  select 1 from public.tournaments t
  where t.id = r.tournament_id and t.status <> 'draft'
);

grant select on public.registration_teams_public to anon, authenticated;
