# NaysTrip production owner setup

This checklist contains only external actions that cannot be completed from the repository. Complete it in order; use test-mode credentials until the final acceptance test.

## 1. Supabase

Purpose: production database, authentication, row-level authorization and private booking-document storage.

1. Open the Supabase project dashboard, then **SQL Editor > New query**.
2. Run the migrations in filename order from `supabase/migrations/001_initial.sql`, `002_lead_crm.sql`, and `003_booking_platform.sql`. Do not rerun or edit an already-recorded production migration; use the Supabase CLI migration workflow if the project already has migration history.
3. In **Authentication > URL Configuration**, set the Site URL to the production site and add these redirect URLs:
   - `https://YOUR_DOMAIN/account/dashboard`
   - `https://YOUR_DOMAIN/account/reset-password`
   - `https://YOUR_DOMAIN/b2b/dashboard`
   - `https://YOUR_DOMAIN/admin`
   - the equivalent Vercel preview URL patterns used by the team
4. In **Authentication > Providers > Email**, enable email/password. Configure a production SMTP provider before launch so recovery messages are deliverable.
5. Confirm **Storage > booking-documents** exists and is private. Migration 003 creates it; do not make it public.
6. In **Project Settings > API**, copy the Project URL, anon key and service-role key into Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Generate a long random value (at least 32 bytes) for `ID_ENCRYPTION_KEY`. Store it in a password manager and Vercel. Losing or rotating it without a data migration makes stored traveller IDs unreadable.
8. Run `corepack pnpm seed` once with the production Supabase variables available. This upserts the 16 supplied Maharashtra packages, preserves their stable slugs, and explicitly leaves them in enquiry-only mode. In Admin, approve a real price and choose **Flexible date** or create a priced departure and choose **Fixed departures** before enabling online booking.
9. Test by registering a customer and confirming that only that customer can read their own booking/document rows.

## 2. Cashfree Payments

Purpose: advance and remaining-balance payments.

1. Open **Cashfree Merchant Dashboard > Developers > API Keys**, switch to Sandbox, and copy the Sandbox App ID and Secret Key.
2. Add `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, and `CASHFREE_ENV=sandbox` to Vercel Preview/Production while testing. Both credentials are server-only.
3. Open **Developers > Webhooks**, add `https://YOUR_DOMAIN/api/payments/webhook`, and select the latest supported webhook version.
4. Subscribe to payment success, payment failed, and user-dropped payment events. The application verifies `x-webhook-signature` with the Cashfree client secret and the exact raw request body.
5. Test in Sandbox: create a low-value approved booking, pay its advance, and confirm the booking changes to confirmed only after Cashfree reports `SUCCESS`. Confirm repeated webhooks do not create duplicate payment credit or notifications.
6. After Cashfree account activation/KYC, replace the Sandbox App ID/Secret with production credentials and set `CASHFREE_ENV=production`. Run one controlled live payment before launch.

## 3. Resend and email DNS

Purpose: enquiry, quotation, booking, payment and reminder email.

1. Open **Resend > Domains > Add Domain**, add the sending subdomain (recommended: `mail.YOUR_DOMAIN`), and add the SPF and DKIM DNS records shown by Resend at the DNS provider. Add DMARC as recommended by the provider.
2. Wait until the domain status is **Verified**.
3. Open **Resend > API Keys > Create API Key** and scope it to sending access.
4. Add these Vercel variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM=NaysTrip Bookings <bookings@YOUR_VERIFIED_DOMAIN>`
   - `BOOKINGS_NOTIFICATION_EMAIL` (internal operations mailbox)
   - `LEADS_NOTIFICATION_EMAIL` (internal sales mailbox)
   - `SUPPORT_EMAIL` (customer-visible support mailbox)
5. Submit a website enquiry and a test booking. In **Admin > Notifications**, verify a provider ID and `sent` status. Also test an intentionally invalid recipient and confirm the booking remains valid while the notification is logged as failed.

## 4. WhatsApp provider

Purpose: optional operational notifications. No WhatsApp success is fabricated when this integration is absent.

1. Choose Meta WhatsApp Cloud API or an approved BSP and obtain an approved sending number, permanent/server token, and approved templates for transactional events.
2. Configure the provider endpoint to accept the payload `{to, event, data}` used by `server/_notifications.js`, or place a provider adapter/proxy at that endpoint.
3. Add:
   - `WHATSAPP_PROVIDER` (for example `meta-cloud` or the BSP name)
   - `WHATSAPP_API_URL`
   - `WHATSAPP_API_TOKEN`
   - `WHATSAPP_LEADS_TO` (internal number in international format)
4. If the provider needs delivery callbacks, create and verify that callback in the provider dashboard before relying on delivery receipts. The current integration records submission to the provider; callback-specific status updates require the selected provider's final callback contract.
5. Send one approved-template test to an opted-in number and confirm the notification log records `sent`; test with variables removed and confirm `skipped_not_configured`.

## 5. Vercel and domain

Purpose: serverless APIs, scheduled reminders and production delivery.

1. In **Vercel Project > Settings > Environment Variables**, add every variable listed in `.env.example` to the correct Preview and Production environments.
2. Set `PUBLIC_SITE_URL=https://YOUR_DOMAIN`.
3. Generate a long random secret for `CRON_SECRET`.
4. Redeploy after variables are saved. Never commit `.env` files or expose service-role/payment secrets as `VITE_` variables.
5. Confirm **Settings > Cron Jobs** shows `/api/cron/reminders` at `0 4 * * *`. Vercel automatically sends the configured cron authorization; manually calling it requires `Authorization: Bearer YOUR_CRON_SECRET`.
6. In **Settings > Domains**, add the production domain and apply the A/CNAME records Vercel displays. Update Supabase redirects, Cashfree webhook URL, Resend links and `PUBLIC_SITE_URL` after the domain is final.
7. Run the acceptance checks: enquiry, customer recovery, checkout/payment/webhook, protected document download, admin actions, approved-agent login, quotation share, and cron endpoint.

## 6. Business and legal details

Purpose: legally correct invoice and travel documents.

1. Supply the legal entity/trade name, registered billing address, GSTIN (only if registered), SAC/HSN treatment, place-of-supply rules, invoice numbering policy, bank/payment instructions, cancellation wording, privacy policy contact and grievance contact.
2. Have the invoice/tax implementation reviewed by the business accountant. The application deliberately does not invent a GST number or legal registration data.
3. Approve real package prices, taxes, advance percentages, departure capacity, pickup points and booking cutoffs in Admin before enabling online booking.
4. Confirm the public support phone, WhatsApp number, email and domain printed in generated PDFs are correct before launch.

## 7. Cloudflare Turnstile

Purpose: CAPTCHA protection for public enquiry forms without blocking authenticated booking APIs.

1. Open **Cloudflare Dashboard > Turnstile > Add widget**, choose **Managed**, and add the production and Vercel preview hostnames used for testing.
2. Copy the site key to `VITE_TURNSTILE_SITE_KEY` and secret key to `TURNSTILE_SECRET_KEY` in Vercel. These must be configured together; only the site key is safe in the browser bundle.
3. Redeploy, submit a contact and custom-trip form, and confirm both save. Then temporarily use an invalid secret in Preview and confirm the API returns a real anti-bot error instead of a fake success.

## Final owner acceptance

- Use one new customer, one approved B2B agent and one non-financial admin account.
- Verify role isolation and that public verification masks the traveller name and exposes no IDs, address or payment secrets.
- Pay an advance and then the balance against the same booking; confirm two payment rows, one booking, and no duplicate voucher emails.
- Download voucher, itinerary, invoice and receipt; inspect pagination and print output.
- Review failed/skipped notifications, cancellation/refund safeguards, webhook events and booking activity history in Admin.

## Portal configuration

### Admin and Super Admin

1. Create the staff user in Supabase Authentication with email/password.
2. Ensure a matching active row exists in `admin_users` using the Auth user ID.
3. Assign `role_id` to a row in `roles`. `Super Admin` receives the broadest legitimate Admin access; financial actions remain restricted by server authorization.
4. Set `admin_users.status` to `active`. Expired, missing or inactive mappings are rejected and the Admin UI clears the invalid session.

### Customers

Customer registration at `/account/register` creates a Supabase Auth user with `portal=customer`; the database trigger creates the related `customers` profile. Customers can access only bookings and protected documents owned by their Auth user ID.

### B2B partners

Partner applications begin at `/b2b/register`. The trigger creates a `b2b_agents` profile with `verification_status=pending`. Review the business details, then set the profile to `approved` before `/b2b/login` grants dashboard access. Pending or rejected profiles cannot use protected agent APIs.

## Public media configuration

1. Run `supabase/migrations/004_public_media.sql` after the earlier migrations. It creates the public `site-media` bucket; keep `booking-documents` private.
2. Admin package, blog and traveller-story forms accept JPG, PNG and WebP files up to 5 MB. Uploads pass through `/api/admin/media`, which checks an active Admin session, MIME type, file signature and size before using the server-only service-role key.
3. Managed files use organized paths such as `packages/{id}/hero`, `packages/{id}/gallery`, `blogs/{id}` and `stories/{id}` with randomized filenames.
4. Existing remote image URLs remain compatible. Upload, preview, replace or remove an image in Admin, then save the record to publish the changed URL.

## Environment variable names

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ID_ENCRYPTION_KEY`, `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_ENV`, `PUBLIC_SITE_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `BOOKINGS_NOTIFICATION_EMAIL`, `LEADS_NOTIFICATION_EMAIL`, `SUPPORT_EMAIL`, `WHATSAPP_PROVIDER`, `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`, `WHATSAPP_LEADS_TO`, `CRON_SECRET`, `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY`.
