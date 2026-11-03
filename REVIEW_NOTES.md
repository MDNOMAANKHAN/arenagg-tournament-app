# ARENAGG code review and hardening notes

## Changes made in this revision

- Registration codes now use 80 bits of randomness (`AGG-` + 20 hexadecimal characters).
- Registration confirmation lookup is rate-limited server-side and uses the service-role key only on the server.
- Registration request bodies are size-limited and malformed JSON is handled cleanly.
- The database registration function validates required fields and substitute completeness in addition to API validation.
- Admin API responses no longer expose raw database error messages to the browser; details are logged server-side.
- Admin result writes are restricted to approved registrations belonging to the selected tournament.
- Admin result editing now supports clearing a previously saved result.
- Registration search includes team, captain, gaming ID, and registration code; status filtering and CSV export were added.
- CSV export protects against spreadsheet formula injection and is admin-authenticated.
- Tournament capacity cannot be reduced below the current non-rejected registration count.
- Tournament and match date-time fields are interpreted consistently as Asia/Kolkata (IST), independent of server timezone.
- Public results only show teams that remain approved.
- Added additional browser security headers and admin no-index/no-store headers.

## Existing Supabase projects

Review and run `supabase/migrations/20261102_security_hardening.sql` once in Supabase SQL Editor. The migration changes the registration-code format for new registrations. Existing 8-hex-character registration codes will no longer open the public confirmation page after this update; ask the organizer to handle old registrations manually or plan a separate legacy-code migration before applying it to a live system.

## New Supabase projects

Run the updated `supabase/schema.sql` once. Do not run both the full schema and the migration on a fresh project.

## Important remaining production checks

- Dependency installation and `next build` could not be completed in this environment because `npm install` timed out. Run `npm install` and `npm run build` locally before deployment.
- Configure `NEXT_PUBLIC_SITE_URL` to the exact production origin.
- Configure the hosting proxy to provide a trustworthy client IP header for rate limiting. Do not trust arbitrary client-supplied forwarding headers.
- Set strong, unique `RATE_LIMIT_SALT` and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Enable Supabase Auth email confirmation for admin accounts, disable public sign-ups, and use MFA for administrator accounts where available.
- Test registration, duplicate IDs, full capacity, rejected-team re-registration, admin authorization, CSV export, and result publishing in a staging Supabase project.
- The app currently supports free registration only. It does not implement UPI payment collection or payment verification.
