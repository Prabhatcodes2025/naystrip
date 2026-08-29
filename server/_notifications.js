import { supabaseRequest } from "./_shared.js";
const htmlEscape = (value) =>
  String(value ?? "").replace(
    /[<>&]/g,
    (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char],
  );
const templates = {
  enquiry_acknowledged: (p) => ({
    subject: `We received your NaysTrip request - ${p.reference}`,
    html: `<h2>Thanks, ${htmlEscape(p.customerName)}</h2><p>Your travel request <strong>${htmlEscape(p.reference)}</strong> is safely with our team. A travel specialist will contact you shortly.</p>`,
  }),
  new_enquiry_internal: (p) => ({
    subject: `New website enquiry - ${p.reference}`,
    html: `<h2>New ${htmlEscape(p.kind)} enquiry</h2><p>${htmlEscape(p.customerName)} - ${htmlEscape(p.phone)} - ${htmlEscape(p.email)}</p><p>Destination: ${htmlEscape(p.destination || "Not specified")}</p>`,
  }),
  quotation_sent: (p) => ({
    subject: `Your NaysTrip proposal - ${p.reference}`,
    html: `<h2>Your travel proposal is ready</h2><p><a href="${htmlEscape(p.url)}">Review quotation ${htmlEscape(p.reference)}</a></p>`,
  }),
  invoice_ready: (p) => ({
    subject: `Invoice ready - ${p.reference}`,
    html: `<h2>Your invoice is ready</h2><p>Open your customer dashboard to securely download it.</p>`,
  }),
  document_ready: (p) => ({
    subject: `${p.documentName || "Travel document"} ready • ${p.reference}`,
    html: `<h2>Your ${htmlEscape(p.documentName || "travel document")} is ready</h2><p>For your security, open the customer dashboard to view or download it.</p><p><a href="${htmlEscape(p.portalUrl)}">Open customer dashboard</a></p>`,
  }),
  payment_reminder: (p) => ({
    subject: `Payment reminder - ${p.reference}`,
    html: `<h2>Balance payment reminder</h2><p>INR ${htmlEscape(p.balanceDue)} remains due for ${htmlEscape(p.packageTitle)}.</p>`,
  }),
  booking_pending: (p) => ({
    subject: `Payment pending for ${p.reference}`,
    html: `<h2>Your NaysTrip booking is ready for payment</h2><p>${htmlEscape(p.customerName)}, your reference is <strong>${htmlEscape(p.reference)}</strong>.</p>`,
  }),
  payment_received: (p) => ({
    subject: `Payment received • ${p.reference}`,
    html: `<h2>Payment received</h2><p>We received INR ${htmlEscape(p.amountPaid)} for ${htmlEscape(p.packageTitle)}. Verification may take a few moments.</p>`,
  }),
  booking_confirmed: (p) => ({
    subject: `Booking confirmed • ${p.reference}`,
    html: `<h2>Your NaysTrip booking is confirmed</h2><p>${htmlEscape(p.customerName)}, your ${htmlEscape(p.packageTitle)} trip starts ${htmlEscape(p.travelDate)}.</p><p>Paid: INR ${htmlEscape(p.amountPaid)} · Balance: INR ${htmlEscape(p.balanceDue)}</p><p><a href="${htmlEscape(p.portalUrl)}">Open customer dashboard</a></p>`,
  }),
  cancellation_requested: (p) => ({
    subject: `Cancellation request received • ${p.reference}`,
    html: `<h2>Cancellation request received</h2><p>Our team will review ${htmlEscape(p.reference)} against the applicable policy.</p>`,
  }),
  cancellation_resolved: (p) => ({
    subject: `Cancellation update - ${p.reference}`,
    html: `<h2>Cancellation request ${htmlEscape(p.status)}</h2><p>Refund due: INR ${htmlEscape(p.refundAmount || 0)}. Open your dashboard for the latest status.</p>`,
  }),
  refund_processed: (p) => ({
    subject: `Refund processed - ${p.reference}`,
    html: `<h2>Your refund has been processed</h2><p>Amount: INR ${htmlEscape(p.refundAmount)}.</p>`,
  }),
  trip_reminder: (p) => ({
    subject: `Upcoming NaysTrip journey • ${p.reference}`,
    html: `<h2>Your trip is coming up</h2><p>${htmlEscape(p.packageTitle)} begins ${htmlEscape(p.travelDate)}. Carry the IDs listed in your voucher.</p>`,
  }),
};
async function record(base) {
  const response = await supabaseRequest("notifications", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    body: JSON.stringify(base),
  });
  if (!response.ok) return null;
  return (await response.json())[0] || null;
}
async function patch(id, data) {
  if (!id) return;
  await supabaseRequest(`notifications?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  });
}
export async function deliverNotification({
  bookingId = null,
  inquiryId = null,
  quotationId = null,
  event,
  recipient,
  channel = "email",
  payload = {},
  idempotencyKey,
}) {
  const provider =
    channel === "email"
      ? "resend"
      : channel === "whatsapp"
        ? process.env.WHATSAPP_PROVIDER || "unconfigured"
        : "system";
  const row = await record({
    booking_id: bookingId,
    inquiry_id: inquiryId,
    quotation_id: quotationId,
    event,
    recipient,
    channel,
    provider,
    status: "pending",
    payload,
    idempotency_key: idempotencyKey,
  });
  if (!row) return { status: "duplicate_or_unavailable" };
  try {
    if (channel === "email") {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
        await patch(row.id, {
          status: "skipped_not_configured",
          error: "Resend is not configured",
          attempts: 1,
        });
        return { status: "skipped_not_configured" };
      }
      const content = (templates[event] || templates.booking_confirmed)(
        payload,
      );
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM,
          to: [recipient],
          subject: content.subject,
          html: `<div style="font-family:Arial,sans-serif;color:#233b4f"><img src="https://www.naystrip.com/branding/naystrip-logo.png" width="170" alt="NaysTrip – Leisure to Adventure">${content.html}<p>Support: ${process.env.SUPPORT_EMAIL || "hello@naystrip.com"} · +91 8097132424</p></div>`,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Resend delivery failed");
      await patch(row.id, {
        status: "sent",
        provider_id: data.id,
        attempts: 1,
        sent_at: new Date().toISOString(),
      });
      return { status: "sent", id: data.id };
    }
    if (channel === "whatsapp") {
      if (!process.env.WHATSAPP_API_URL || !process.env.WHATSAPP_API_TOKEN) {
        await patch(row.id, {
          status: "skipped_not_configured",
          error: "WhatsApp provider is not configured",
          attempts: 1,
        });
        return { status: "skipped_not_configured" };
      }
      const response = await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: recipient, event, data: payload }),
      });
      if (!response.ok) throw new Error("WhatsApp delivery failed");
      const data = await response.json();
      await patch(row.id, {
        status: "sent",
        provider_id: data.id || data.message_id || null,
        attempts: 1,
        sent_at: new Date().toISOString(),
      });
      return { status: "sent" };
    }
    await patch(row.id, {
      status: "sent",
      attempts: 1,
      sent_at: new Date().toISOString(),
    });
    return { status: "sent" };
  } catch (error) {
    await patch(row.id, {
      status: "failed",
      error: error.message,
      attempts: 1,
    });
    return { status: "failed", error: error.message };
  }
}
