-- ARENAGG schema. Run once in Supabase → SQL Editor.
create extension if not exists pgcrypto;

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  default_team_size int not null check (default_team_size between 1 and 10)
);
insert into public.games (slug, name, default_team_size) values
  ('free-fire-max','Free Fire MAX',4), ('bgmi','BGMI',4), ('valorant','Valorant',5)
on conflict (slug) do nothing;

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('super_admin','organizer')),
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id),
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '' check (char_length(description) <= 500),
  starts_at timestamptz not null,
  team_size int not null check (team_size between 1 and 10),
  max_teams int not null check (max_teams between 2 and 500),
  rules text not null default '' check (char_length(rules) <= 5000),
  status text not null default 'draft' check (status in ('draft','open','closed','live','completed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tournaments (game_id);
create index on public.tournaments (status, starts_at);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  reg_code text not null unique,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_name text not null check (char_length(team_name) between 2 and 40),
  captain_name text not null check (char_length(captain_name) between 2 and 60),
  captain_contact text not null check (char_length(captain_contact) between 5 and 80),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create unique index uq_reg_team on public.registrations (tournament_id, lower(team_name)) where status <> 'rejected';
create index on public.registrations (tournament_id, status);

create table public.registration_members (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  gaming_id text not null check (char_length(gaming_id) between 3 and 40),
  role text not null check (role in ('captain','player','substitute')),
  active boolean not null default true
);
create unique index uq_member_id on public.registration_members (tournament_id, lower(gaming_id)) where active;
create index on public.registration_members (registration_id);
create index on public.registration_members (lower(gaming_id));

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_label text not null check (char_length(round_label) between 1 and 60),
  match_no int not null check (match_no >= 1),
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','live','completed','cancelled')),
  created_at timestamptz not null default now()
);
create index on public.matches (tournament_id, match_no);

create table public.tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  placement int not null check (placement >= 1),
  points int not null default 0 check (points >= 0),
  kills int not null default 0 check (kills >= 0),
  published boolean not null default false,
  unique (tournament_id, registration_id)
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 1
);

-- helpers ---------------------------------------------------------
create function public.is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
create function public.is_super_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid() and role = 'super_admin') $$;

create function public.touch_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;
create trigger trg_touch before update on public.tournaments for each row execute function public.touch_updated_at();

-- rejected teams free their name + gaming IDs
create function public.sync_members_active() returns trigger language plpgsql security definer set search_path = public as
$$ begin update public.registration_members set active = (new.status <> 'rejected') where registration_id = new.id; return new; end $$;
create trigger trg_sync after update of status on public.registrations
  for each row when (old.status is distinct from new.status) execute function public.sync_members_active();

create function public.check_rate_limit(p_key text, p_limit int, p_window int) returns boolean
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start < now() - make_interval(secs => p_window) then now() else r.window_start end,
    hits = case when r.window_start < now() - make_interval(secs => p_window) then 1 else r.hits + 1 end
  returning hits into c;
  return c <= p_limit;
end $$;

-- atomic registration: capacity, team size, duplicates, unique ID -------
create function public.register_team(p jsonb) returns text language plpgsql security definer set search_path = public as $$
declare t public.tournaments%rowtype; rid uuid; code text; m jsonb; n int; cname text;
begin
  select * into t from public.tournaments where id = (p->>'tournament_id')::uuid for update;
  if not found or t.status <> 'open' or t.starts_at <= now() then raise exception 'CLOSED'; end if;
  select count(*) into n from public.registrations where tournament_id = t.id and status <> 'rejected';
  if n >= t.max_teams then raise exception 'FULL'; end if;
  if coalesce(jsonb_typeof(p->'teammates'), '') <> 'array' then raise exception 'TEAM_SIZE'; end if;
  if jsonb_array_length(p->'teammates') <> t.team_size - 1 then raise exception 'TEAM_SIZE'; end if;
  if nullif(trim(p->>'team_name'), '') is null or nullif(trim(p->>'captain_name'), '') is null
     or nullif(trim(p->>'captain_game_id'), '') is null or nullif(trim(p->>'captain_contact'), '') is null then
    raise exception 'INVALID_REGISTRATION';
  end if;
  loop
    code := 'AGG-' || upper(encode(gen_random_bytes(10), 'hex')); -- 80 bits of randomness
    exit when not exists (select 1 from public.registrations where reg_code = code);
  end loop;
  insert into public.registrations (reg_code, tournament_id, team_name, captain_name, captain_contact)
    values (code, t.id, trim(p->>'team_name'), trim(p->>'captain_name'), trim(p->>'captain_contact')) returning id into rid;
  insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
    values (rid, t.id, trim(p->>'captain_name'), trim(p->>'captain_game_id'), 'captain');
  for m in select value from jsonb_array_elements(p->'teammates') loop
    insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
      values (rid, t.id, trim(m->>'name'), trim(m->>'game_id'), 'player');
  end loop;
  if jsonb_typeof(p->'substitute') = 'object' then
    if nullif(trim(p->'substitute'->>'name'), '') is null or nullif(trim(p->'substitute'->>'game_id'), '') is null then
      raise exception 'INVALID_REGISTRATION';
    end if;
    insert into public.registration_members (registration_id, tournament_id, name, gaming_id, role)
      values (rid, t.id, trim(p->'substitute'->>'name'), trim(p->'substitute'->>'game_id'), 'substitute');
  end if;
  return code;
exception when unique_violation then
  get stacked diagnostics cname = constraint_name;
  if cname = 'uq_reg_team' then raise exception 'DUPLICATE_TEAM'; else raise exception 'DUPLICATE_ID'; end if;
end $$;

revoke execute on function public.register_team(jsonb), public.check_rate_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.register_team(jsonb), public.check_rate_limit(text,int,int) to service_role;

-- public, safe-by-construction read models -------------------------
create view public.tournament_public as
select t.id, t.title, t.description, t.starts_at, t.team_size, t.max_teams, t.rules, t.status,
       g.slug as game_slug, g.name as game_name,
       (select count(*) from public.registrations r where r.tournament_id = t.id and r.status <> 'rejected')::int as registered
from public.tournaments t join public.games g on g.id = t.game_id
where t.status <> 'draft';

create view public.results_public as
select tr.tournament_id, t.title, g.name as game_name, g.slug as game_slug, r.team_name, tr.placement, tr.points, tr.kills
from public.tournament_results tr
join public.tournaments t on t.id = tr.tournament_id
join public.games g on g.id = t.game_id
join public.registrations r on r.id = tr.registration_id
where tr.published and r.status = 'approved';

create function public.get_registration_public(p_code text)
returns table (team_name text, status text, tournament_title text, game_name text, starts_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.team_name, r.status, t.title, g.name, t.starts_at, r.created_at
  from public.registrations r join public.tournaments t on t.id = r.tournament_id join public.games g on g.id = t.game_id
  where r.reg_code = upper(p_code) and p_code ~* '^AGG-[0-9A-F]{20}$' $$;

grant select on public.tournament_public, public.results_public to anon, authenticated;
revoke execute on function public.get_registration_public(text) from public, anon, authenticated;
grant execute on function public.get_registration_public(text) to service_role;

-- RLS ----------------------------------------------------------------
alter table public.games enable row level security;
alter table public.admins enable row level security;
alter table public.tournaments enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_members enable row level security;
alter table public.matches enable row level security;
alter table public.tournament_results enable row level security;
alter table public.rate_limits enable row level security;

revoke all on public.registrations, public.registration_members, public.rate_limits, public.admins, public.tournament_results from anon;
revoke all on public.rate_limits from authenticated;

create policy games_read on public.games for select using (true);
create policy games_super on public.games for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy admins_self on public.admins for select using (user_id = auth.uid());
create policy t_public on public.tournaments for select using (status <> 'draft');
create policy t_admin_read on public.tournaments for select using (public.is_admin());
create policy t_admin_ins on public.tournaments for insert with check (public.is_admin());
create policy t_admin_upd on public.tournaments for update using (public.is_admin()) with check (public.is_admin());
create policy t_super_del on public.tournaments for delete using (public.is_super_admin());
create policy reg_admin_read on public.registrations for select using (public.is_admin());
create policy reg_admin_upd on public.registrations for update using (public.is_admin()) with check (public.is_admin());
create policy mem_admin_read on public.registration_members for select using (public.is_admin());
create policy m_public on public.matches for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.status <> 'draft'));
create policy m_admin on public.matches for all using (public.is_admin()) with check (public.is_admin());
create policy res_admin on public.tournament_results for all using (public.is_admin()) with check (public.is_admin());
-- rate_limits: no policies → unreachable except via service role.

-- Create your first admin AFTER adding the user in Authentication → Users:
-- insert into public.admins (user_id, email, role) select id, email, 'super_admin' from auth.users where email = 'you@example.com';
INSERT INTO public.admins (user_id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'mdnomaankhan5@gmail.com';