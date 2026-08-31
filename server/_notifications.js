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
  document_ready: (p) => {
    const type=p.documentType;
    const title=type==="hotel_voucher"?"Hotel Booking Voucher":type==="transport_voucher"?"Transport Booking Voucher":type==="invoice"?`Invoice ${p.invoiceNumber||""}`:p.documentName||"Travel Document";
    const subject=type==="hotel_voucher"?`Your Hotel Booking Voucher | ${p.reference} | NaysTrip`:type==="transport_voucher"?`Your Transport Booking Voucher | ${p.reference} | NaysTrip`:type==="invoice"?`Invoice ${p.invoiceNumber||p.reference} | NaysTrip`:`${title} | ${p.reference} | NaysTrip`;
    const detail=type==="hotel_voucher"?`<p><strong>Hotel:</strong> ${htmlEscape(p.hotelName||"Confirmed accommodation")}<br><strong>Check-in / check-out:</strong> ${htmlEscape(p.checkIn||"-")} / ${htmlEscape(p.checkOut||"-")}<br><strong>Status:</strong> ${htmlEscape(p.bookingStatus||"confirmed")}</p>`:type==="transport_voucher"?`<p><strong>Route:</strong> ${htmlEscape(p.route||"Confirmed transport service")}<br><strong>Travel date:</strong> ${htmlEscape(p.travelDate||"-")}<br>${p.vehicle?`<strong>Vehicle:</strong> ${htmlEscape(p.vehicle)}<br>`:""}<strong>Reference:</strong> ${htmlEscape(p.reference)}</p>`:type==="invoice"?`<p><strong>Invoice number:</strong> ${htmlEscape(p.invoiceNumber)}<br><strong>Booking reference:</strong> ${htmlEscape(p.reference||"-")}<br><strong>Invoice date:</strong> ${htmlEscape(p.invoiceDate||"-")}<br><strong>Total:</strong> INR ${htmlEscape(p.total||0)}<br><strong>Paid:</strong> INR ${htmlEscape(p.paid||0)}<br><strong>Balance:</strong> INR ${htmlEscape(p.balance||0)}</p>`:`<p><strong>Reference:</strong> ${htmlEscape(p.reference)}</p>`;
    return {subject,html:`<h2 style="margin:0 0 12px;color:#173c34">Hello ${htmlEscape(p.customerName||"Traveller")},</h2><p>Your NaysTrip ${htmlEscape(title)} is ready.</p>${detail}<p style="margin:24px 0"><a href="${htmlEscape(p.documentUrl)}" style="display:inline-block;background:#f45c0f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:700">View / download ${htmlEscape(title)}</a></p><p style="color:#59636b;font-size:13px">This secure link expires automatically. The PDF is also attached when size permits.</p>`};
  },
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
  attachments = [],
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
      if(!recipient)throw new Error("Recipient email is missing");
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
          html: `<div style="background:#fff8f1;padding:24px"><div style="max-width:620px;margin:auto;background:#fff;border-top:6px solid #f45c0f;padding:28px;font-family:Arial,sans-serif;color:#233b4f"><img src="https://www.naystrip.com/branding/naystrip-logo.png" width="170" alt="NaysTrip - Leisure to Adventure" style="margin-bottom:24px">${content.html}<hr style="border:0;border-top:1px solid #dde2e5;margin:28px 0"><p style="font-size:13px;color:#59636b">Support: ${htmlEscape(process.env.SUPPORT_EMAIL || "hello@naystrip.com")} | +91 8097132424</p></div></div>`,
          ...(attachments.length?{attachments:attachments.map((item)=>({filename:item.filename,content:Buffer.from(item.content).toString("base64")}))}:{}),
        }),
      });
      const data = await response.json().catch(()=>({}));
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
