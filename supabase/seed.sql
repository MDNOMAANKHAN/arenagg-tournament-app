-- Local dev seed only. Runs on `supabase db reset` / first `supabase start`.
-- Creates one confirmed admin account so /admin is usable locally.
-- Local login: mdnomaankhan5@gmail.com / arenagg-dev-123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'mdnomaankhan5@gmail.com',
  crypt('arenagg-dev-123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '', '', '', ''
where not exists (select 1 from auth.users where email = 'mdnomaankhan5@gmail.com');

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.email = 'mdnomaankhan5@gmail.com'
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );

insert into public.admins (user_id, email, role)
select u.id, u.email, 'super_admin'
from auth.users u
where u.email = 'mdnomaankhan5@gmail.com'
on conflict (user_id) do nothing;

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
