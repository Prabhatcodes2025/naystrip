import crypto from "node:crypto";
import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";
import { bookingReference, clean, uuidPattern } from "../_validation.js";

const publicQuoteUrl = (quote, token) =>
  `${process.env.PUBLIC_SITE_URL || "https://naystrip.vercel.app"}/quotation/${quote.reference}?token=${token}`;

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const id = clean(req.body?.id, 40);
  const action = req.body?.action;
  if (!uuidPattern.test(id)) return json(res, 422, { error: "Invalid quotation" });

  const response = await supabaseRequest(`quotations?id=eq.${id}&select=*,lines:quotation_lines(*)&limit=1`);
  const [quote] = await response.json();
  if (!quote) return json(res, 404, { error: "Quotation not found" });

  if (action === "status") {
    const status = ["draft", "sent", "accepted", "rejected", "expired", "cancelled"].includes(req.body.status)
      ? req.body.status
      : null;
    if (!status) return json(res, 422, { error: "Invalid status" });
    await supabaseRequest(`quotations?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    return json(res, 200, { updated: true });
  }

  if (["preview", "share"].includes(action)) {
    const token = crypto.randomBytes(24).toString("base64url");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    await supabaseRequest(`quotations?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        access_token_hash: hash,
        ...(action === "share" && quote.status === "draft" ? { status: "sent" } : {}),
        updated_at: new Date().toISOString(),
      }),
    });
    return json(res, 200, { url: publicQuoteUrl(quote, token) });
  }

  if (action === "convert") {
    if (quote.converted_booking_id) return json(res, 200, { bookingId: quote.converted_booking_id, duplicate: true });
    const reference = bookingReference("NTB");
    const booking = {
      reference,
      quotation_id: quote.id,
      booking_source: "quotation",
      travel_date: quote.travel_start,
      end_date: quote.travel_end,
      traveller_count: Math.max(1, Number(quote.traveller_count || 1)),
      adult_count: Math.max(1, Number(quote.traveller_count || 1)),
      child_count: 0,
      infant_count: 0,
      room_count: 1,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      advance_required: quote.advance_required || quote.total,
      balance_due: quote.total,
      amount_paid: 0,
      currency: quote.currency,
      status: "pending",
      operational_status: "draft",
      payment_state: "pending",
      billing: { name: quote.customer_name, email: quote.customer_email, phone: quote.customer_phone },
      customer_notes: quote.notes,
      admin_notes: "Created from quotation; assign customer, package and traveller details before payment.",
      idempotency_key: `quotation:${quote.id}`,
    };
    const inserted = await supabaseRequest("bookings", {
      method: "POST",
      headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify(booking),
    });
    const rows = await inserted.json();
    const created = rows[0] || (await (await supabaseRequest(`bookings?quotation_id=eq.${quote.id}&select=id,reference&limit=1`)).json())[0];
    await supabaseRequest(`quotations?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "accepted", converted_booking_id: created.id, updated_at: new Date().toISOString() }),
    });
    await supabaseRequest("booking_activity", {
      method: "POST",
      body: JSON.stringify({
        booking_id: created.id,
        action: "converted_from_quotation",
        actor_id: admin.user_id,
        actor_type: "admin",
        details: { quotation: quote.reference },
      }),
    });
    return json(res, 201, { bookingId: created.id, reference: created.reference });
  }

  return json(res, 422, { error: "Unknown action" });
}
