-- Allow tournament organizers to set larger capacities (up to 500 entries).
-- Solo tournaments count each registration as one player; squad tournaments count each registration as one team.
ALTER TABLE public.tournaments
  DROP CONSTRAINT IF EXISTS tournaments_max_teams_check;

ALTER TABLE public.tournaments
  ADD CONSTRAINT tournaments_max_teams_check
  CHECK (max_teams BETWEEN 2 AND 500);
