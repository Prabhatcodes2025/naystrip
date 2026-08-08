import { guard, json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
import {
  bookingReference,
  clean,
  dateOnly,
  emailPattern,
  phonePattern,
  uuidPattern,
} from "../_validation.js";
import { encryptPrivate } from "../_crypto.js";

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  const session = await requirePortalUser(req, res, "agent");
  if (!session) return;
  if (req.method !== "POST")
    return json(res, 405, { error: "Method not allowed" });
  const body = req.body || {};
  if (!uuidPattern.test(body.rateId) || !dateOnly(body.travelDate))
    return json(res, 422, {
      error: "Select a valid private rate and travel date",
    });
  const customerName = clean(body.customerName, 120),
    email = clean(body.email, 160),
    phone = clean(body.phone, 24),
    idNumber = clean(body.idNumber, 120);
  const travellers = Math.max(1, Math.min(50, Number(body.travellers || 1)));
  if (
    !customerName ||
    !emailPattern.test(email) ||
    !phonePattern.test(phone) ||
    !idNumber
  )
    return json(res, 422, {
      error: "Complete the lead traveller and customer contact details",
    });
  const rateResponse = await supabaseRequest(
    `package_agent_rates?id=eq.${body.rateId}&active=eq.true&select=*,package:packages(id,title,status,booking_enabled)&limit=1`,
  );
  const [rate] = rateResponse.ok ? await rateResponse.json() : [];
  const today = new Date().toISOString().slice(0, 10);
  if (
    !rate ||
    rate.package?.status !== "published" ||
    !rate.package?.booking_enabled ||
    (rate.valid_from && rate.valid_from > today) ||
    (rate.valid_until && rate.valid_until < today)
  )
    return json(res, 409, { error: "This partner rate is no longer bookable" });
  const total = Math.round(Number(rate.agent_price) * travellers * 100) / 100;
  const reference = bookingReference();
  const insert = await supabaseRequest("bookings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      reference,
      agent_id: session.profile.id,
      package_id: rate.package.id,
      booking_source: "b2b",
      travel_date: body.travelDate,
      traveller_count: travellers,
      adult_count: travellers,
      child_count: 0,
      infant_count: 0,
      room_count: Math.max(1, Number(body.roomCount || 1)),
      subtotal: total,
      discount: 0,
      tax: 0,
      total,
      advance_required: total,
      amount_paid: 0,
      balance_due: total,
      currency: "INR",
      status: "pending",
      payment_state: "pending",
      operational_status: "pending_payment",
      billing: {
        name: customerName,
        email,
        phone,
        address: clean(body.address, 500),
      },
      customer_notes: clean(body.notes, 2000),
      idempotency_key: `b2b:${session.profile.id}:${clean(req.headers["idempotency-key"], 120) || crypto.randomUUID()}`,
    }),
  });
  if (!insert.ok)
    return json(res, 502, { error: "Partner booking could not be created" });
  const [booking] = await insert.json();
  const parts = customerName.split(/\s+/);
  await supabaseRequest("booking_travellers", {
    method: "POST",
    body: JSON.stringify({
      booking_id: booking.id,
      traveller_type: "adult",
      first_name: parts.shift(),
      last_name: parts.join(" ") || null,
      full_name: customerName,
      nationality: clean(body.nationality, 60) || "Indian",
      id_type: clean(body.idType, 30) || "Aadhaar",
      id_number_encrypted: encryptPrivate(idNumber),
      phone,
      email,
    }),
  });
  await supabaseRequest("booking_activity", {
    method: "POST",
    body: JSON.stringify({
      booking_id: booking.id,
      action: "b2b_booking_created",
      actor_id: session.user.id,
      actor_type: "agent",
      details: { rate_id: rate.id, agent_price: rate.agent_price },
    }),
  });
  return json(res, 201, {
    booking: {
      reference,
      total,
      balance_due: total,
      operational_status: "pending_payment",
    },
  });
}
