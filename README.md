# NaysTrip & Treks

Production-oriented travel catalogue and enquiry platform for NaysTrip & Treks ("Leisure to Adventure"). The public experience is built with React 19, Vite, React Router and Tailwind CSS. Vercel serverless functions handle protected enquiries, Supabase authentication/data access and Razorpay order verification.

## Included

- Premium responsive public website with NaysTrip identity and official contacts/social links
- Sixteen structured Maharashtra packages imported from the supplied itinerary document
- Search and duration filtering, source-preserving day itineraries, inclusions, exclusions, notes and cancellation slabs
- Three-step custom trip planner and contact/quote forms
- Customer, B2B partner and admin authentication entry points backed by Supabase Auth
- PostgreSQL/Supabase schema for roles, customers, agents, packages, departures, enquiries, bookings, travellers, payments, refunds, content, media and audit logs
- Idempotent REST seed script using the structured package source
- Server-side Razorpay order creation, signature verification and signed webhook processing
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

The seed upserts categories and packages by stable slugs, replaces itinerary/items for each package, and can be safely run again.

## Environment variables

Copy `.env.example` to the relevant local/Vercel environment and provide:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `RESEND_FROM`, `BOOKINGS_NOTIFICATION_EMAIL`, `LEADS_NOTIFICATION_EMAIL`, `SUPPORT_EMAIL` when email delivery is enabled
- `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN` when WhatsApp notifications are enabled
- `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` for production bot protection

Never expose service-role, gateway-secret or notification tokens through a `VITE_` variable.

## Deployment

Vercel serves the Vite output from `dist`. A single Hobby-compatible catch-all function at `api/[...route].js` dispatches the unchanged API URLs to implementation modules under `server/`. Configure all secrets in the Vercel project, apply the database migration, seed content, create approved admin accounts in Supabase Auth, and register `/api/payments/webhook` in Razorpay before accepting payments. The full route map is in [docs/API_ARCHITECTURE.md](docs/API_ARCHITECTURE.md).

The exact dashboard paths, webhook events, DNS work and acceptance tests are in [docs/OWNER_SETUP.md](docs/OWNER_SETUP.md).

## Source-content policy

Maharashtra route sequence, durations, destinations, direct-payment notes, inclusions/exclusions and cancellation percentages follow the supplied NaysTrip documents. Package prices and fixed departures are intentionally not fabricated; they remain "on request" until operational inventory is connected.
