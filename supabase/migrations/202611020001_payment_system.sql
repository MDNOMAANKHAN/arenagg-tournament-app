
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_status
TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_utr TEXT;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS payment_submitted_at
TIMESTAMPTZ;

ALTER TABLE public.registrations
ADD CONSTRAINT payment_status_check
CHECK (
  payment_status IN (
    'pending',
    'paid',
    'rejected'
  )
);

ALTER TABLE public.tournaments
DROP CONSTRAINT IF EXISTS tournaments_max_teams_check;

ALTER TABLE public.tournaments
ADD CONSTRAINT tournaments_max_teams_check
CHECK (max_teams BETWEEN 2 AND 12);
