# ARENAGG — bug log (local dev)

Confirmed on a local run (Next.js 14 dev + full local Supabase stack).
Three reported bugs, the new payment-proof feature, and the extra bugs found
while testing.

---

## 1. "All" tab not working

**Reproduced.** Clicking a game tab filters correctly, but the filter state and
the "All" tab index came from two different sources, so the UI got stuck.

Two separate faults:

**1a. `?game=freefire` — wrong slug from the game cards.**
`src/components/GameShowcase.tsx` linked Free Fire to `/?game=freefire`, but the
`games` table slug is `free-fire-max`. That link produced an empty results page
("No tournaments available") instead of the Free Fire tournaments.

**1b. A bad/unknown `?game=` value was treated as an active filter.**
`src/app/(site)/page.tsx` applied `eq('game_slug', searchParams.game)` for any
value, and the "All" button was only highlighted when `!searchParams.game`.
So with `?game=freefire` you got zero tournaments *and* the "All" tab was not
highlighted — the site looked broken and "All" appeared not to work.

**Fix**

- `GameShowcase.tsx`: Free Fire card now links to `/?game=free-fire-max`.
- `page.tsx`: the `?game=` value is validated against the real game slugs
  fetched from the database. An unknown slug is ignored, so the full list
  renders and "All" is highlighted. Tab highlighting now uses that validated
  value (`activeGame`) instead of the raw query string.

**Verified:** `All` → both tournaments, `?game=bgmi` → BGMI only with the BGMI
tab highlighted and All de-highlighted, `?game=valorant` → empty state,
`?game=freefire` (old link) → full list, All highlighted, no dead end.

---

## 2. Amount not reflecting on the user site

**Reproduced.** The site always showed **₹100** and the tournament page always
wrote **"Free"**, no matter what the admin set.

**Cause.** `entry_fee` did not exist anywhere:

- no `entry_fee` column on `public.tournaments`
- not exposed by the `tournament_public` view

But the code already read it: `PublicTournament.entry_fee`, the register page
(`t.entry_fee`), and `RegisterForm` (`amount={t.entry_fee ?? 100}`). Since the
column was missing, the value was always `undefined`, so:

- the tour page hard-coded the literal text `Free`
- the registration page silently fell back to the hardcoded `100`
- the UPI QR was always built for ₹100

There was also a second, conflicting UPI ID: `src/lib/payment.ts` had
`733454040@ybl` while `UPIPayment.tsx` hard-coded `7330804540@ybl`, so the
"UPI ID" text and the QR could disagree with each other.

**Fix**

- New column `public.tournaments.entry_fee int not null default 100` with a
  `0..100000` check, exposed through the `tournament_public` view.
  **100 is now the default for every new tournament** and the admin can change
  it per tournament (set `0` for free).
- `tournamentSchema` validates `entry_fee` (`0..100000`, default `100`).
- Admin form (`TournamentForm.tsx`): **Entry fee (₹)** field, pre-filled with
  100, sent on create and update.
- Public tournament page: `Entry fee` now shows `₹250` / `Free` from the data
  instead of the literal `Free`.
- Register page header: `Entry ₹250` / `Free entry` instead of always
  `Free entry`.
- `RegisterForm`: the payment section is hidden entirely for free tournaments
  (`entry_fee = 0`), and otherwise uses the real fee and the real tournament
  and team names in the UPI note. The amount is no longer defaulted to 100.
- `register_team()` stamps `registrations.payment_amount` from the tournament
  fee, so the admin sees what to collect for each team.
- UPI ID consolidated: `UPIPayment.tsx` imports `UPI_ID` from
  `src/lib/payment.ts` (now `7330804540@ybl`), so the text, the QR and the
  pay link can never diverge again.

**Verified:** set fee to ₹250 through the admin API → tournament page shows
`₹250`, register page shows `Entry ₹250` and `Pay ₹250` with
`7330804540@ybl`. A free tournament hides the payment block and shows
`Free entry`.

---

## 3. Cancel tournament from admin

**Reproduced.** There was no cancel action at all — the dashboard only had
Edit / Registrations / Matches, and the API had no way to express it: the
status check constraint and the Zod enum allowed only
`draft|open|closed|live|completed`.

**Fix**

- DB: `tournaments_status_check` now allows `cancelled`.
- `TOURNAMENT_STATUSES` + `tournamentSchema` include `cancelled`, so
  `PATCH /api/admin/tournaments` accepts `{ status: 'cancelled' }`.
- New `src/components/CancelTournament.tsx`: confirm dialog, then PATCHes the
  status and refreshes. Once cancelled it renders a disabled "Cancelled" chip
  instead of the button.
- Admin dashboard action row is now a 2×2 grid with the fourth button being
  **Cancel** (red). `cancelled` also got a red status pill.
- `TournamentForm` status dropdown includes **Cancelled**.
- Public side: `slotInfo()` returns the label `Cancelled`, so the tournament
  page and cards show "Cancelled" and hide the register button. The register
  page shows "Cancelled. Back to tournament" instead of the form.

**Verified:** clicking Cancel on the dashboard flips the pill to `cancelled`,
replaces the button with the disabled chip, and the public tournament page
shows `CANCELLED` with no register button; `/register/<id>` says
`Cancelled. Back to tournament`.

**Note:** cancel is deliberately *not* a delete — the tournament and its
registrations stay in the database for the record. `register_team()` already
rejects any status other than `open`, so no new team can register.

---

## 4. NEW FEATURE — payment screenshot upload

The registration flow collected a UPI payment but gave the organiser no proof
and no way to record it. `registrations.payment_utr` existed but was never
written.

**Flow now**

1. Team registers → lands on `/registration/<code>`.
2. That page has a **Payment** section (paid tournaments only) showing the fee,
   the payment status and an uploader.
3. Team uploads a PNG/JPG/WEBP screenshot (max 5 MB) and can paste the UPI
   reference / UTR. Live preview before upload, `Replace screenshot` after.
4. Admin → Registrations gets a **Payment** column per team: amount, status
   pill, `View screenshot` (modal), the UTR, and `Mark paid` / `Unverify` /
   `Reject` buttons.

**How it is built**

- `registrations.payment_proof_path` + `payment_proof_uploaded_at`
  (`supabase/migrations/20261106000001_payment_proofs.sql`).
- Private storage bucket `payment-proofs` (5 MB cap, png/jpeg/webp only, not
  public, no storage RLS policies — the service role is the only writer).
- `POST /api/register/<code>/payment-proof`: same-origin check, rate limited
  (10 / 10 min per IP), size and **file-signature** validation (a renamed
  `.txt` is rejected even when the browser claims `image/png`), refuses rejected
  registrations, stores the file, updates the row, and deletes the previous
  screenshot on re-upload so orphans don't pile up.
- `GET /api/admin/payment-proof/<id>`: admin-only stream of the file. Verified
  `401` without a session — the bucket cannot be read directly.
- `PaymentProofUpload.tsx` (public) and `PaymentProofCell.tsx` (admin, with the
  viewer modal).
- `get_registration_public()` now returns the payment fields so the
  confirmation page can say "screenshot received".
- CSV export gained Entry Fee / Payment Status / UPI Reference / Payment
  Screenshot columns.

**Verified end-to-end in the browser:** register → confirmation page → upload →
"Payment screenshot received" → admin shows `UNVERIFIED ₹100`, opens the
screenshot, `Mark paid` → pill flips to `PAID`.

**Caveat:** it is still a manual check. Nothing verifies the UTR against a bank
feed; `payment_status` only changes when an admin clicks.

---

## 5. Bugs found while testing (also fixed)

Not in the report, but visibly broken:

**5a. The CSS design primitives never existed.** `globals.css` defines 34
`arena-*` / `admin-*` classes but **not** `wrap`, `card`, `btn`, `st`, `input`,
`bar`, `rise` or `l` — and those are used 100+ times across 13 files. They were
never in any commit either, so cards, buttons, status pills and form controls
were rendering as bare unstyled text everywhere. Confirmed with
`getComputedStyle` (`.st` → `border: 0px, padding: 0px, border-radius: 0px`).
Defined all of them at the top of `globals.css` (below the Tailwind layers so
utilities still win), plus base `table` styling — the results/matches tables
were collapsing their headers into `TeamPlacementPointsKills`.

**5b. `fadeInUp` keyframes were missing.** Nine inline
`animation: 'fadeInUp ...'` usages (home cards, tournament page, admin
dashboard, `TournamentCard`) referenced an animation that only existed as
`arenaFadeUp`. Those elements animated from `opacity: 0` and stayed invisible.
Added the `fadeInUp` keyframes.

**5c. `/tournaments` always 404'd.** `src/app/(site)/tournaments/page.tsx` was
a copy of the detail page reading `params.id` (undefined there) and calling
`notFound()`. Rewritten as a real list page (all tournaments, per-game filter
chips, fee/slots/entry, Details + Register buttons). The header nav now points
at it instead of `/#tournaments`.

**5d. `max_teams` was constrained to 2..12 in SQL but validated to 2..500.**
`202611020001_payment_system.sql` narrows `tournaments_max_teams_check` to
`BETWEEN 2 AND 12`, while `tournamentSchema` still allowed 500 and the form had
`max="100"`. Anything above 12 would have failed at the database with a generic
"Could not save". Validation and the form now cap at 12 to match.

---

## Other things fixed to get this running

These were blocking `npm run dev` from working at all against a local database:

| Problem | Fix |
| --- | --- |
| `supabase/schema.sql` was never a migration, so the first `ALTER TABLE public.registrations` in `202611020001_payment_system.sql` failed with `relation does not exist` | Added `supabase/migrations/20261101000000_base_schema.sql` (a copy of `schema.sql`, timestamped first) |
| Every `security definer` function sets `search_path = public`, but pgcrypto is installed in the `extensions` schema, so `register_team()` died with `function gen_random_bytes(integer) does not exist` → registration always returned 500 | `20261103000000_local_dev_search_path.sql` adds `extensions` to those functions; `register_team()` is redefined with `search_path = public, extensions` |
| The app queries `registration_teams_public`, which no schema or migration ever created → the public tournament page always said "Team status is temporarily unavailable" | `20261103000001_local_dev_registration_teams_view.sql` creates the view |
| New tables were not reachable through the Data API (`permission denied for table games`) | `auto_expose_new_tables = true` in `supabase/config.toml` (plus explicit grants in the new migrations) |
| No admin user, so `/admin` could not be entered | `supabase/seed.sql` seeds one confirmed super_admin with an `auth.identities` row |

Local development credentials are intentionally not documented in this repository. Use private local environment setup only, and never reuse seeded development credentials in production.

---

## Still open (not touched)

- `registration_teams_public` is a local reconstruction. If the production
  Supabase project has a different definition, match it before deploying — the
  real definition belongs in `supabase/schema.sql`.
- **Migrations that must also be applied to the production Supabase project**,
  otherwise the deployed site still shows Free / ₹100 and has no cancel or
  upload: `20261106000000_entry_fee_and_cancelled_status.sql` and
  `20261106000001_payment_proofs.sql` (the latter also creates the
  `payment-proofs` storage bucket).
- The registration `t` (form-open timestamp) honeypot rejects anything faster
  than 3 s; a very fast autofill can trip it. Left as-is deliberately.
- The global `tbody tr:hover` rule I added will also highlight admin table rows;
  it is cosmetic only.
