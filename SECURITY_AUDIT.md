# ARENAGG application security audit

Audit scope: repository source on `main`, reviewed while preparing the server-validation hardening PR. This is a source review, not a live penetration test or security certification.

## Changes in this PR

- Require a same-origin `Origin` header for public registration and payment-proof POSTs (HTTPS except local development).
- Stream request bodies through a byte-limit reader before multipart parsing, so the cap is enforced even when `Content-Length` is absent or inaccurate.
- Limit multipart registration/payment-proof requests to 5 MiB plus a small multipart overhead allowance.
- Limit admin JSON mutation bodies to 32 KiB and reject non-JSON content types.
- Use strict Zod objects so unexpected properties are rejected instead of silently ignored.
- Validate gaming IDs, contacts, names, tournament/match/result ranges, and non-empty PATCH payloads on the server.
- Validate payment UTR/reference strings rather than truncating untrusted input.
- Add a registration honeypot and minimum/maximum submission-age checks server-side.
- Remove the CI workflow's write permission and automatic lockfile push. CI now uses read-only repository permission.
- Run `npm audit --audit-level=high` across production and development dependencies (not only production packages).

## Existing controls observed

- Admin routes require a verified administrator and TOTP MFA/AAL2 in the proxy and server helper.
- Admin mutations check the request Origin.
- Payment-proof files are private and server-uploaded with file-signature checks; the admin download route checks admin access.
- Registration is handled through a server-side RPC with database constraints for tournament capacity/team and gaming-ID uniqueness.
- Public read views have a migration for security-invoker mode and narrow grants.

## Follow-up items that require staging/live configuration or additional review

1. Verify deployed Supabase RLS policies and grants match the checked-in migrations; migrations are not automatically applied by this PR.
2. Confirm the private `payment-proofs` bucket settings and browser-role Storage grants in the Supabase dashboard.
3. Confirm public Auth sign-up is disabled, admin MFA is enabled, and the service-role key exists only in server-side Vercel variables.
4. Validate the trusted client-IP header in the Vercel deployment. Rate limits depend on the platform proxy's IP header; do not accept client-controlled forwarding headers on a self-hosted deployment.
5. Run staging tests for free/paid registrations, invalid/oversized requests, duplicate team/gaming IDs, tournament full/closed states, payment-proof replacement, admin MFA, CRUD, CSV export, and result publication.
6. Review dependency audit and CI results after this PR's checks finish. A passing source review does not imply a clean live deployment.
7. Review the separate endpoints (privacy request, exports, admin payment-status actions, and any other routes not covered by the shared admin resource handler) individually before claiming a complete API audit.

## Verification status

- Source changes reviewed.
- Automated CI checks: pending PR run.
- Staging/live functional tests: not performed.
- Supabase dashboard configuration: not verified.
