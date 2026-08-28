import { guard, json, supabaseRequest } from "./_shared.js";
import { rateLimit } from "./_rate-limit.js";
import { deliverNotification } from "./_notifications.js";
import { verifyCaptcha } from "./_captcha.js";
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phone = /^[+\d][\d\s()-]{7,20}$/;
const clean = (v, max = 500) =>
  String(v ?? "")
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, max);
export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (!rateLimit(req))
    return json(res, 429, {
      error: "Too many requests. Please wait a few minutes and try again.",
    });
  const {
    kind,
    payload = {},
    clientReference,
    website,
    captchaToken,
  } = req.body || {};
  if (
    website !== "naystrip.com" ||
    !["contact", "custom_trip", "package_quote", "quick_quote"].includes(kind)
  )
    return json(res, 400, { error: "Invalid request" });
  const captcha = await verifyCaptcha(
    captchaToken,
    req.headers["x-forwarded-for"],
  );
  if (!captcha.success) return json(res, 403, { error: captcha.error });
  const suppliedName = clean(
    payload.name || `${payload.firstName || ""} ${payload.lastName || ""}`,
    120,
  );
  const name = suppliedName || (kind === "quick_quote" ? "Quick quote request" : "");
  const phoneNumber = clean(payload.phone, 24);
  const emailAddress = clean(payload.email, 160);
  if (kind === "custom_trip" && Array.isArray(payload.childAges) && payload.childAges.some((age) => Number(age) < 0 || Number(age) > 12))
    return json(res, 422, { error: "Child age must be between 0 and 12" });
  if (
    !name ||
    !phone.test(phoneNumber) ||
    (emailAddress && !email.test(emailAddress))
  )
    return json(res, 422, {
      error: "Please check your name, phone and email.",
    });
  const normalizedPayload = Object.fromEntries(
    Object.entries(payload)
      .slice(0, 60)
      .map(([key, value]) => [
        clean(key, 60),
        typeof value === "object"
          ? clean(JSON.stringify(value), 5000)
          : clean(value, 1000),
      ]),
  );
  const source = [
    clean(payload.source, 120) || "Website",
    clean(payload.utm_source, 60),
    clean(payload.utm_campaign, 80),
  ]
    .filter(Boolean)
    .join(" • ");
  const record = {
    id: clean(clientReference, 60),
    kind,
    name,
    phone: phoneNumber,
    email: emailAddress || null,
    destination: clean(payload.destination || payload.to, 160) || null,
    payload: {
      ...normalizedPayload,
      pageUrl: clean(req.headers.referer, 500),
      userAgent: clean(req.headers["user-agent"], 300),
    },
    source,
    status: "new",
  };
  try {
    const db = await supabaseRequest("inquiries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(record),
    });
    if (!db.ok) {
      const detail = await db.text();
      if (db.status === 409)
        return json(res, 200, { id: record.id, duplicate: true });
      console.error("lead_insert_failed", db.status, detail.slice(0, 300));
      return json(res, 502, {
        error: "We could not save your request. Please call or WhatsApp us.",
      });
    }
    const rows = await db.json();
    const inquiryId = rows[0]?.id || record.id;
    const notificationPayload = {
      reference: inquiryId,
      kind,
      customerName: name,
      phone: phoneNumber,
      email: emailAddress,
      destination: record.destination,
    };
    const jobs = [];
    if (emailAddress)
      jobs.push(
        deliverNotification({
          inquiryId,
          event: "enquiry_acknowledged",
          recipient: emailAddress,
          payload: notificationPayload,
          idempotencyKey: `enquiry-ack:${inquiryId}`,
        }),
      );
    if (process.env.LEADS_NOTIFICATION_EMAIL)
      jobs.push(
        deliverNotification({
          inquiryId,
          event: "new_enquiry_internal",
          recipient: process.env.LEADS_NOTIFICATION_EMAIL,
          payload: notificationPayload,
          idempotencyKey: `new-enquiry-email:${inquiryId}`,
        }),
      );
    if (process.env.WHATSAPP_LEADS_TO)
      jobs.push(
        deliverNotification({
          inquiryId,
          event: "new_enquiry_internal",
          recipient: process.env.WHATSAPP_LEADS_TO,
          channel: "whatsapp",
          payload: notificationPayload,
          idempotencyKey: `new-enquiry-whatsapp:${inquiryId}`,
        }),
      );
    await Promise.allSettled(jobs);
    return json(res, 201, { id: inquiryId });
  } catch (err) {
    if (err.message === "SERVICE_NOT_CONFIGURED")
      return json(res, 503, {
        error:
          "Online enquiries are being configured. Please call or WhatsApp +91 8097132424.",
      });
    console.error("lead_handler_failed", err);
    return json(res, 500, { error: "Please call or WhatsApp us to continue." });
  }
}
