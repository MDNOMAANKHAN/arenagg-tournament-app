# ARENAGG — setup (laptop)

1. **Supabase**: create a project → SQL Editor → paste and run `supabase/schema.sql`.
2. **First admin**: Authentication → Users → *Add user* (email + password, tick auto-confirm). Then run:
   `insert into public.admins (user_id, email, role) select id, email, 'super_admin' from auth.users where email = 'you@example.com';`
   Turn off public email sign-ups in Supabase Auth.
3. Copy `.env.example` to `.env.local` and fill all five values (Supabase URL, anon key, service-role key, site URL, rate-limit salt). Never expose the service-role key in browser code or commit `.env.local`.
4. Run `npm install` and `npm run dev`. Public site: http://localhost:3000. Admin: http://localhost:3000/admin.
5. Create a tournament with status **Published · registrations open**, submit a test registration, approve it in the admin panel, then add matches and results.
6. Registration management includes search by team/captain/gaming ID/registration code, status filters, and admin-only CSV export. Tournament and match date/time fields use India Standard Time (IST).
7. Registration codes use 80 bits of randomness. Public code lookup is server-only and rate-limited.
8. For an existing Supabase project, review and run `supabase/migrations/20261102_security_hardening.sql` once. For a new project, run the updated `supabase/schema.sql` instead; do not run both. The migration invalidates old 8-hex-character confirmation URLs.

# AWS (cheap) — see decision notes
- **S3 + CloudFront alone cannot run this app**: registration and admin need server code and secret keys, so a static export is not enough.
- **Possible low-traffic option**: build the `Dockerfile` (Next.js standalone + Lambda Web Adapter), push to ECR, deploy the image to Lambda, and put CloudFront in front. This needs careful configuration and usage monitoring; do not assume it will stay within a fixed annual budget. Pass the three NEXT_PUBLIC_* values as `--build-arg`, and set the server env vars on Lambda.
  `docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain -t arenagg .`
- CloudFront: forward all cookies, query strings and the `Origin`/`x-forwarded-for` data to the origin, and set caching to disabled for `/api/*` and `/admin/*` (cache `/_next/static/*` for a year).
- **Simpler alternative**: AWS Amplify Hosting supports Next.js SSR and GitHub deployments, but pricing depends on build minutes, data transfer and usage. Check current AWS pricing before choosing.
- Note: a Lambda Function URL with auth NONE is reachable without CloudFront. Admin data is still protected by login + RLS.
