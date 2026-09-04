import { randomUUID } from "node:crypto";
import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";
import { clean, money, normalizeEmail, validEmail, uuidPattern } from "../_validation.js";

async function databaseError(response, fallback) {
  const details = await response.json().catch(() => ({}));
  console.error("quotation_database_failed", response.status, details);
  const message = clean(details?.message || details?.details, 300);
  return message ? `${fallback}: ${message}` : fallback;
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  try {
    if (req.method === "GET") {
      const agentFilter=uuidPattern.test(req.query?.agentId||"")?"&agent_id=eq."+req.query.agentId:"";
      const response = await supabaseRequest("quotations?select=*,agent:b2b_agents(id,business_name),inquiry:inquiries(id,enquiry_source,package_id),lines:quotation_lines(*)&order=created_at.desc"+agentFilter);
      return response.ok
        ? json(res, 200, { quotations: await response.json() })
        : json(res, 502, { error: await databaseError(response, "Unable to load quotations") });
    }
    if (!["POST", "PATCH"].includes(req.method)) return json(res, 405, { error: "Method not allowed" });
    const body = req.body || {};
    const isUpdate = req.method === "PATCH";
    const id = clean(body.id, 40);
    if (isUpdate && !uuidPattern.test(id)) return json(res, 422, { error: "Invalid quotation" });
    const lines = (body.lines || []).slice(0, 100).map((line, index) => ({
      description: clean(line.description, 500), quantity: Math.max(.01, Number(line.quantity || 1)),
      unit_price: money(line.unitPrice), sort_order: index,
    })).filter((line) => line.description);
    const customerEmail=normalizeEmail(body.customerEmail);
    if(customerEmail&&!validEmail(customerEmail))return json(res,422,{error:"Enter a valid customer email address"});
    if (!clean(body.customerName, 120) || !clean(body.title, 200) || !lines.length) return json(res, 422, { error: "Customer, title and at least one line item are required" });
    const subtotal = money(lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0));
    const discount = Math.min(subtotal, money(body.discount));
    const taxable = Math.max(0, subtotal - discount);
    const tax = money(taxable * Math.min(100, Math.max(0, Number(body.taxPercent || 0))) / 100);
    const inquiryId = clean(body.inquiryId, 60) || null;
    if (inquiryId) {
      const inquiryResponse = await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(inquiryId)}&select=id&limit=1`);
      if (!inquiryResponse.ok) return json(res, 502, { error: await databaseError(inquiryResponse, "Unable to validate the lead reference") });
      const inquiries = await inquiryResponse.json();
      if (!inquiries[0]) return json(res, 422, { error: "Lead reference was not found. Select an existing lead ID or leave it blank." });
    }
    const reference = `NTQ-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const quote = {
      ...(isUpdate ? {} : { reference, created_by: admin.user_id }),
      inquiry_id: inquiryId, customer_name: clean(body.customerName, 120),
      customer_email: customerEmail || null, customer_phone: clean(body.customerPhone, 24) || null,
      title: clean(body.title, 200), destination: clean(body.destination, 200) || null,
      travel_start: body.travelStart || null, travel_end: body.travelEnd || null,
      traveller_count: Math.max(1, Number(body.travellerCount || 1)), valid_until: body.validUntil || null,
      subtotal, discount, tax, total: money(taxable + tax), advance_required: money(body.advanceRequired),
      terms: clean(body.terms, 5000) || null, notes: clean(body.notes, 5000) || null,
      ...(isUpdate ? { updated_at: new Date().toISOString() } : {}),
    };
    const insert = await supabaseRequest(isUpdate ? `quotations?id=eq.${id}` : "quotations", { method: isUpdate ? "PATCH" : "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(quote) });
    if (!insert.ok) return json(res, 502, { error: await databaseError(insert, `Unable to ${isUpdate ? "update" : "create"} quotation`) });
    const [created] = await insert.json();
    if (!created) return json(res, 404, { error: "Quotation not found" });
    if (isUpdate) {
      const removed = await supabaseRequest(`quotation_lines?quotation_id=eq.${id}`, { method: "DELETE" });
      if (!removed.ok) return json(res, 502, { error: await databaseError(removed, "Quotation updated but existing line items could not be replaced") });
    }
    const lineInsert = await supabaseRequest("quotation_lines", { method: "POST", body: JSON.stringify(lines.map((line) => ({ ...line, quotation_id: created.id }))) });
    if (!lineInsert.ok) {
      if (!isUpdate) await supabaseRequest(`quotations?id=eq.${created.id}`, { method: "DELETE" });
      return json(res, 502, { error: await databaseError(lineInsert, "Quotation line items could not be saved") });
    }
    return json(res, isUpdate ? 200 : 201, { quotation: { ...created, lines } });
  } catch (error) {
    console.error("quotations_failed", error);
    return json(res, 500, { error: "Quotation service unavailable" });
  }
}
