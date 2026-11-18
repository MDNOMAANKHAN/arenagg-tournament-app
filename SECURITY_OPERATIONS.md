# ARENAGG security and privacy operations

This document is an operational checklist, not a security certification or legal opinion. The repository cannot perform actions inside the live Supabase or Vercel dashboards.

## Admin authentication and MFA

- Admin routes require a valid Supabase session and a matching row in `public.admins`.
- Admin access now requires a verified TOTP factor and an AAL2 session. New administrators are sent to `/admin/mfa` to enrol; existing administrators must enter a current authenticator code.
- Enable TOTP enrollment and verification in the deployed Supabase Auth configuration. Deploy the updated `supabase/config.toml` with the Supabase CLI, or enable TOTP in the hosted Auth settings.
- Keep public sign-ups disabled in the hosted project. Create admin identities manually and grant access through `public.admins`.
- Test a fresh admin login, an enrolled admin login, an ordinary non-admin login, and an admin API call without AAL2 before production rollout.

## Database and storage

- Apply `20261112000000_public_views_read_only.sql` and review its grants/policies against the live schema before rollout. It makes the public views read-only and revokes direct browser access to Storage objects.
- Payment proof uploads already use the private `payment-proofs` bucket, a server-only service-role client, image signature checks and a 5 MB application limit. The admin download endpoint streams files only after checking the admin session.
- Verify in Supabase that `payment-proofs` is private, browser roles have no Storage object privileges, and the service-role key exists only in server-side Vercel environment variables.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client bundles or commit it to Git.

## Audit logging

- `20261118000000_admin_activity_log.sql` creates database triggers and the `admin_activity` table. The admin Activity History page reads the latest 100 events.
- Apply the migration in Supabase and verify INSERT/UPDATE/DELETE events appear. The log is not a substitute for Supabase Auth logs, Vercel logs or database backups.

## Privacy requests and retention

- Verify the requester’s identity and their authority to act for the data subject before disclosing, correcting or deleting information.
- Record the request, date received, identity-check outcome, data systems searched, action taken, exceptions/retention reason and completion date in a restricted case log.
- Proposed operational retention schedule (confirm with an Indian privacy/legal professional before adopting):
  - Unsuccessful or abandoned upload files: remove within 30 days.
  - Payment proof screenshots and transaction references: retain for 12 months after the tournament ends, unless a dispute, chargeback, legal hold or law requires longer.
  - Registration contact details and team-member personal data: retain for 12 months after the tournament ends, then delete or irreversibly anonymise unless needed for an active dispute or legal obligation.
  - Public tournament results and non-identifying statistics: may be retained for historical reporting.
  - Security logs: retain for at least the period required by applicable law and CERT-In directions; confirm the exact scope and storage location with counsel.
- Do not automatically delete records until the legal basis, accounting obligations, active disputes and backup-expiry process have been reviewed. Deletion from primary tables does not immediately remove data from database backups.

## Backups and recovery

- Configure automated database backups and point-in-time recovery appropriate to the Supabase plan. Export critical configuration and migration history separately.
- Back up private payment-proof objects using an encrypted, access-restricted process; database backups alone do not guarantee object recovery.
- At least quarterly, restore a recent backup into an isolated project, verify registrations, tournaments, RLS, Storage objects and admin access, and record the restore duration and any gaps.
- Never test restore procedures against production data or overwrite production during a drill.

## Incident response

- Preserve relevant logs, restrict compromised accounts/keys, rotate secrets, assess affected data and systems, and document the timeline and remediation.
- Confirm applicable reporting deadlines and regulator/user notification duties with qualified counsel. CERT-In reporting requirements may apply depending on the entity and incident.

## Legal operator and grievance details — owner action required

Before public launch, publish the real legal operator name, business/correspondence address, a monitored privacy/grievance email or other legally suitable channel, and the responsible contact/person where required. Do not publish a home address or invent a company identity. Have the Terms, Privacy Policy, refund rules, minor participation process and applicable Indian-law disclosures reviewed by a qualified lawyer.

## Not yet automated

This repository does not independently verify parental consent, send guardian approval emails/SMS, run scheduled retention deletion, configure Supabase/Vercel backups, or perform a restore drill. These require a verified guardian-contact workflow, a configured messaging provider, live dashboard access and operational testing. Do not describe those controls as active until completed.
