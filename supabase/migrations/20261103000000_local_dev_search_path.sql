-- Local dev compatibility only.
--
-- supabase/schema.sql defines every SECURITY DEFINER function with
-- `set search_path = public`, but locally (and on Supabase cloud) pgcrypto
-- lives in the `extensions` schema, so gen_random_bytes() / crypt() are not
-- resolvable inside those functions:
--   register_team -> ERROR: function gen_random_bytes(integer) does not exist
--
-- This adds `extensions` to the search_path of the affected functions so the
-- code runs as written locally. The proper fix belongs in supabase/schema.sql
-- (use `set search_path = public, extensions`).

alter function public.is_admin() set search_path = public, extensions;
alter function public.is_super_admin() set search_path = public, extensions;
alter function public.sync_members_active() set search_path = public, extensions;
alter function public.check_rate_limit(text, int, int) set search_path = public, extensions;
alter function public.register_team(jsonb) set search_path = public, extensions;
alter function public.get_registration_public(text) set search_path = public, extensions;
