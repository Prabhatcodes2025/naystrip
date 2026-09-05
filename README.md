# NaysTrip & Treks

Production-oriented travel catalogue and enquiry platform for NaysTrip & Treks ("Leisure to Adventure"). The public experience is built with React 19, Vite, React Router and Tailwind CSS. Vercel serverless functions handle protected enquiries, Supabase authentication/data access and Cashfree order verification.

## Included

- Premium responsive public website with NaysTrip identity and official contacts/social links
- Thirty-six structured tour, trek and expedition packages available for safe Supabase import
- Search and duration filtering, source-preserving day itineraries, inclusions, exclusions, notes and cancellation slabs
- Three-step custom trip planner and contact/quote forms
- Customer, B2B partner and admin authentication entry points backed by Supabase Auth
- PostgreSQL/Supabase schema for roles, customers, agents, packages, departures, enquiries, bookings, travellers, payments, refunds, content, media and audit logs
- Insert-only, idempotent REST import using stable slugs and the structured package source
- Server-side Cashfree order creation, payment-status verification and signed webhook processing
- Static sitemap, robots policy, manifest, canonical metadata and TravelAgency structured data

## Local development

```bash
corepack pnpm install --lockfile=false
corepack pnpm run dev
corepack pnpm run lint
corepack pnpm run build
```

The repository retains its original `package-lock.json`. The lockfile-free pnpm command is used in the Codex workspace only because the bundled runtime provides pnpm rather than npm.

## Database

Apply every file in `supabase/migrations/` in numeric order with the Supabase CLI or SQL editor. Then configure the server variables and run:

```bash
corepack pnpm run seed
```

The import reads all 36 static package definitions, skips any slug already in Supabase, and adds itinerary/items only for newly inserted packages. It never overwrites admin-edited rows and never creates B2B rates. Keep the static public fallback until the import report and public database rendering have been verified; only then remove that fallback in a separate change.

## Environment variables

Copy `.env.example` to the relevant local/Vercel environment and provide:

- Required platform: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL`, `ID_ENCRYPTION_KEY`, `CRON_SECRET`
- Required for online payments: `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_ENV`
- `RESEND_API_KEY`, `RESEND_FROM`, `BOOKINGS_NOTIFICATION_EMAIL`, `LEADS_NOTIFICATION_EMAIL`, `SUPPORT_EMAIL` when email delivery is enabled
- `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN` when WhatsApp notifications are enabled
- `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` together for production bot protection; omit both to keep enquiry forms available without CAPTCHA

Never expose service-role, gateway-secret or notification tokens through a `VITE_` variable.

## Deployment

Vercel serves the Vite output from `dist`. An API-first rewrite sends every unchanged `/api/*` URL to the single Hobby-compatible function at `api/index.js`, which delegates to implementation modules under `server/`. Configure all secrets in the Vercel project, apply the database migration, seed content, create approved admin accounts in Supabase Auth, and register `/api/payments/webhook` in Cashfree before accepting payments. The full route map is in [docs/API_ARCHITECTURE.md](docs/API_ARCHITECTURE.md).

The exact dashboard paths, webhook events, DNS work and acceptance tests are in [docs/OWNER_SETUP.md](docs/OWNER_SETUP.md).

## Source-content policy

Maharashtra route sequence, durations, destinations, direct-payment notes, inclusions/exclusions and cancellation percentages follow the supplied NaysTrip documents. Package prices and fixed departures are intentionally not fabricated; they remain "on request" until operational inventory is connected.
