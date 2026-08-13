# Vercel Hobby API architecture

The public API contract remains unchanged. An API-first rewrite sends all `/api/*` requests to the single Vercel Function `api/index.js`, which delegates to handlers in `server/`. This explicit rewrite prevents the SPA fallback from serving `index.html` for API requests. Files under `server/` are imported implementation modules, not independently deployed functions.

| Existing URL | Methods | Handler | Primary caller |
|---|---|---|---|
| `/api/config` | GET | `server/config.js` | Environment-aware public Turnstile state |
| `/api/leads` | POST | `server/leads.js` | Contact, custom-trip and package-customisation forms |
| `/api/departures` | GET | `server/departures.js` | Public fixed departures |
| `/api/auth/admin` | POST | `server/auth/admin.js` | Admin login |
| `/api/auth/portal` | POST | `server/auth/portal.js` | Customer and B2B login |
| `/api/auth/register` | POST | `server/auth/register.js` | Customer and B2B registration |
| `/api/auth/recover` | POST | `server/auth/recover.js` | Customer and B2B recovery |
| `/api/auth/update-password` | POST | `server/auth/update-password.js` | Customer and B2B reset |
| `/api/bookings/options` | GET | `server/bookings/options.js` | Tour detail and checkout |
| `/api/bookings/preview` | POST | `server/bookings/preview.js` | Checkout server pricing |
| `/api/bookings/create` | POST | `server/bookings/create.js` | Authenticated checkout |
| `/api/bookings/verify` | GET | `server/bookings/verify.js` | Public safe verification page |
| `/api/portal/dashboard` | GET | `server/portal/dashboard.js` | Customer dashboard |
| `/api/portal/profile` | PATCH | `server/portal/profile.js` | Customer profile editor |
| `/api/portal/cancel` | POST | `server/portal/cancel.js` | Customer cancellation request |
| `/api/b2b/dashboard` | GET | `server/b2b/dashboard.js` | Approved-agent dashboard/rates |
| `/api/b2b/create-booking` | POST | `server/b2b/create-booking.js` | Approved-agent booking form |
| `/api/admin/leads` | GET, PATCH | `server/admin/leads.js` | Admin CRM |
| `/api/admin/bookings` | GET, PATCH | `server/admin/bookings.js` | Admin bookings, cancellations and manual payments |
| `/api/admin/quotations` | GET, POST | `server/admin/quotations.js` | Quotation builder |
| `/api/admin/quotation-actions` | POST | `server/admin/quotation-actions.js` | Share, status and conversion actions |
| `/api/admin/packages` | GET, POST, PATCH, DELETE | `server/admin/packages.js` | Package/tour CRUD |
| `/api/admin/departures` | GET, POST, PATCH, DELETE | `server/admin/departures.js` | Departure CRUD |
| `/api/admin/notifications` | GET | `server/admin/notifications.js` | Notification log |
| `/api/settings` | POST | `server/settings.js` | Admin settings |
| `/api/payments/create-order` | POST | `server/payments/create-order.js` | Advance/balance checkout |
| `/api/payments/verify` | POST | `server/payments/verify.js` | Cashfree server-side payment-status verification |
| `/api/payments/webhook` | POST | `server/payments/webhook.js` | Cashfree signed webhook |
| `/api/documents/booking` | GET | `server/documents/booking.js` | Protected voucher/invoice/receipt/itinerary download |
| `/api/documents/itinerary` | GET | `server/documents/itinerary.js` | Public package itinerary PDF |
| `/api/documents/quotation` | GET | `server/documents/quotation.js` | Protected admin quotation PDF |
| `/api/quotations/view` | GET | `server/quotations/view.js` | Token-protected customer quote view |
| `/api/cron/reminders` | GET, POST | `server/cron/reminders.js` | Vercel Cron |

## Raw-body and authorization behavior

The catch-all entry disables automatic body parsing. `server/router.js` parses JSON and form data only for ordinary routes and deliberately leaves `/api/payments/webhook` untouched. Cashfree HMAC verification therefore runs against the exact received bytes. Customer ownership, approved-agent authorization, admin roles/financial permissions, private document checks and `CRON_SECRET` verification remain inside their existing handlers.

## Function count

- Before consolidation: 46 JavaScript files under `/api` (32 endpoint handlers plus 14 helper/document modules).
- After consolidation: 1 function entry, `api/index.js`.
