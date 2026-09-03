import {agentDeals,adminDeals} from "./b2b/deals.js";
import mathCaptcha from "./auth/math-captcha.js";
import wallet, {adminWallet} from "./b2b/wallet.js";
import adminBookings from "./admin/bookings.js";
import adminBookingDocuments from "./admin/booking-documents.js";
import adminDocumentDelivery from "./admin/document-delivery.js";
import adminInvoices from "./admin/invoices.js";
import adminContent from "./admin/content.js";
import adminCustomers from "./admin/customers.js";
import adminAgents from "./admin/agents.js";
import adminDepartures from "./admin/departures.js";
import adminLeads from "./admin/leads.js";
import adminNotifications from "./admin/notifications.js";
import adminSubscribers from "./admin/subscribers.js";
import adminMedia from "./admin/media.js";
import adminPackages from "./admin/packages.js";
import adminQuotationActions from "./admin/quotation-actions.js";
import adminQuotations from "./admin/quotations.js";
import authAdmin from "./auth/admin.js";
import authPortal from "./auth/portal.js";
import authRecover from "./auth/recover.js";
import authRegister from "./auth/register.js";
import authUpdatePassword from "./auth/update-password.js";
import b2bCreateBooking from "./b2b/create-booking.js";
import b2bDashboard from "./b2b/dashboard.js";
import bookingCreate from "./bookings/create.js";
import bookingOptions from "./bookings/options.js";
import bookingPreview from "./bookings/preview.js";
import bookingVerify from "./bookings/verify.js";
import cronReminders from "./cron/reminders.js";
import content from "./content.js";
import publicConfig from "./config.js";
import departures from "./departures.js";
import documentBooking from "./documents/booking.js";
import documentItinerary from "./documents/itinerary.js";
import documentQuotation from "./documents/quotation.js";
import documentServiceVoucher from "./documents/service-voucher.js";
import leads from "./leads.js";
import newsletter from "./newsletter.js";
import paymentCreateOrder from "./payments/create-order.js";
import paymentVerify from "./payments/verify.js";
import paymentWebhook from "./payments/webhook.js";
import packages from "./packages.js";
import portalCancel from "./portal/cancel.js";
import portalDashboard from "./portal/dashboard.js";
import portalProfile from "./portal/profile.js";
import quotationView from "./quotations/view.js";
import settings from "./settings.js";

export const routes = new Map([
 ["b2b/deals",agentDeals], ["admin/deals",adminDeals],
  ["auth/math-captcha", mathCaptcha],
  ["b2b/wallet", wallet],
  ["admin/wallet", adminWallet],
  ["admin/agents", adminAgents],
  ["admin/bookings", adminBookings],
  ["admin/booking-documents", adminBookingDocuments],
  ["admin/document-delivery", adminDocumentDelivery],
  ["admin/invoices", adminInvoices],
  ["admin/content", adminContent],
  ["admin/customers", adminCustomers],
  ["admin/departures", adminDepartures],
  ["admin/leads", adminLeads],
  ["admin/notifications", adminNotifications],
  ["admin/subscribers", adminSubscribers],
  ["admin/media", adminMedia],
  ["admin/packages", adminPackages],
  ["admin/tours", adminPackages],
  ["admin/quotation-actions", adminQuotationActions],
  ["admin/quotations", adminQuotations],
  ["auth/admin", authAdmin],
  ["auth/portal", authPortal],
  ["auth/recover", authRecover],
  ["auth/register", authRegister],
  ["auth/update-password", authUpdatePassword],
  ["b2b/create-booking", b2bCreateBooking],
  ["b2b/dashboard", b2bDashboard],
  ["bookings/create", bookingCreate],
  ["bookings/options", bookingOptions],
  ["bookings/preview", bookingPreview],
  ["bookings/verify", bookingVerify],
  ["cron/reminders", cronReminders],
  ["config", publicConfig],
  ["content", content],
  ["departures", departures],
  ["documents/booking", documentBooking],
  ["documents/itinerary", documentItinerary],
  ["documents/quotation", documentQuotation],
  ["documents/service-voucher", documentServiceVoucher],
  ["leads", leads],
  ["newsletter", newsletter],
  ["payments/create-order", paymentCreateOrder],
  ["payments/verify", paymentVerify],
  ["payments/webhook", paymentWebhook],
  ["packages", packages],
  ["portal/cancel", portalCancel],
  ["portal/dashboard", portalDashboard],
  ["portal/profile", portalProfile],
  ["quotations/view", quotationView],
  ["settings", settings],
]);

export function routeFromRequest(req) {
  const parameter = req.query?.route;
  if (Array.isArray(parameter))
    return parameter
      .map(String)
      .join("/")
      .replace(/^\/+|\/+$/g, "");
  if (typeof parameter === "string")
    return decodeURIComponent(parameter).replace(/^\/+|\/+$/g, "");
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  return pathname.replace(/^\/api\//, "").replace(/^\/+|\/+$/g, "");
}

async function parseBody(req) {
  if (req.body !== undefined || ["GET", "HEAD"].includes(req.method)) return;
  const type = String(req.headers["content-type"] || "").toLowerCase();
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    const value = Buffer.from(chunk);
    bytes += value.length;
    if (bytes > (type.includes("application/pdf") ? 10_000_000 : 2_000_000))
      throw Object.assign(new Error("Request body too large"), {
        statusCode: 413,
      });
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks);
  if (type.includes("application/pdf")) {
    req.body = buffer;
    return;
  }
  const raw = buffer.toString("utf8");
  if (!raw) {
    req.body = {};
    return;
  }
  if (type.includes("application/json")) {
    try {
      req.body = JSON.parse(raw);
    } catch {
      throw Object.assign(new Error("Invalid JSON payload"), {
        statusCode: 400,
      });
    }
    return;
  }
  if (type.includes("application/x-www-form-urlencoded")) {
    req.body = Object.fromEntries(new URLSearchParams(raw));
    return;
  }
  req.body = raw;
}

export default async function dispatch(req, res) {
  const route = routeFromRequest(req);
  const handler = routes.get(route);
  if (!handler) return res.status(404).json({ error: "API route not found" });
  try {
    if (!["payments/webhook", "admin/media"].includes(route)) await parseBody(req);
    return await handler(req, res);
  } catch (error) {
    if (error?.statusCode)
      return res.status(error.statusCode).json({ error: error.message });
    console.error("api_router_failed", { route, error });
    return res.status(500).json({ error: "API request failed" });
  }
}
