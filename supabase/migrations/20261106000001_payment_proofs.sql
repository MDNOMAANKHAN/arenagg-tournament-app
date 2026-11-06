-- Payment proof (screenshot upload) + entry fee default.
--
-- 1. registrations.payment_proof_path / payment_proof_uploaded_at
--    The public registration flow collects a UPI payment but had no way to
--    hand the organiser any proof. The screenshot is stored in a PRIVATE
--    storage bucket and only its object path is kept on the row; admins get a
--    short-lived signed URL from the server.
--
-- 2. entry_fee now defaults to 100 for new tournaments (organiser can change
--    it per tournament, 0 = free).
--
-- 3. get_registration_public() reports the payment state so the confirmation
--    page can show "proof received / not uploaded yet".

alter table public.registrations
  add column if not exists payment_proof_path text;

alter table public.registrations
  add column if not exists payment_proof_uploaded_at timestamptz;

-- Private bucket. 5 MB cap, images only. No storage RLS policies on purpose:
-- anonymous users upload through /api/register/[code]/payment-proof using the
-- service role, never directly against storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

alter table public.tournaments
  alter column entry_fee set default 100;

-- The public lookup now carries the payment fields. Changing the OUT column
-- list of a `returns table` function requires a drop first.
drop function if exists public.get_registration_public(text);

create function public.get_registration_public(p_code text)
returns table (
  team_name text,
  status text,
  tournament_title text,
  game_name text,
  starts_at timestamptz,
  created_at timestamptz,
  entry_fee int,
  payment_amount numeric,
  payment_status text,
  payment_utr text,
  has_payment_proof boolean
)
language sql stable security definer set search_path = public, extensions as $$
  select r.team_name, r.status, t.title, g.name, t.starts_at, r.created_at,
         t.entry_fee, r.payment_amount, r.payment_status, r.payment_utr,
         (r.payment_proof_path is not null)
  from public.registrations r
  join public.tournaments t on t.id = r.tournament_id
  join public.games g on g.id = t.game_id
  where r.reg_code = upper(p_code) and p_code ~* '^AGG-[0-9A-F]{20}$'
$$;

revoke execute on function public.get_registration_public(text) from public, anon, authenticated;
grant execute on function public.get_registration_public(text) to service_role;
