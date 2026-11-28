-- Local dev seed only. Runs on `supabase db reset` / first `supabase start`.
-- No admin account or password is seeded. Create a local admin manually using
-- the instructions in README.md and use a unique password outside this file.

-- Two open tournaments (one per game) so the game filter tabs, entry fee
-- display and the public team list can all be exercised locally.
insert into public.tournaments (id, game_id, title, description, starts_at, team_size, max_teams, entry_fee, rules, status)
select
  '22222222-2222-4222-8222-222222222222',
  g.id,
  'ARENAGG Dev Scrims',
  'Local development tournament.',
  now() + interval '7 days',
  g.default_team_size,
  12,
  100,
  'Dev only.',
  'open'
from public.games g
where g.slug = 'free-fire-max'
on conflict (id) do nothing;

insert into public.tournaments (id, game_id, title, description, starts_at, team_size, max_teams, entry_fee, rules, status)
select
  '33333333-3333-4333-9333-333333333333',
  g.id,
  'ARENAGG BGMI Dev Cup',
  'Second local development tournament.',
  now() + interval '10 days',
  g.default_team_size,
  12,
  0,
  'Free entry, dev only.',
  'open'
from public.games g
where g.slug = 'bgmi'
on conflict (id) do nothing;
