import {safeAgent} from "../b2b/profile.js";
import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";
import { clean, uuidPattern } from "../_validation.js";

const allowedRoles = new Set(["Super Admin", "B2B Manager"]);
const allowedStatuses = new Set(["pending", "approved", "rejected", "suspended"]);

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (!allowedRoles.has(admin.role?.name)) return json(res, 403, { error: "B2B Manager or Super Admin access is required" });
  if (req.method === "GET") {
    const response = await supabaseRequest("b2b_agents?select=id,user_id,business_name,contact_person,email,phone,gst_number,pan,address,website,business_type,bank_details,verification_status,created_at,updated_at,documents:agent_documents(id,document_type,object_path,verified_at)&order=created_at.desc&limit=500");
    return response.ok ? json(res, 200, { agents: (await response.json()).map(safeAgent) }) : json(res, 502, { error: "Partner applications could not be loaded" });
  }
  if (req.method !== "PATCH") return json(res, 405, { error: "Method not allowed" });
  const id = clean(req.body?.id, 40);
  const status = clean(req.body?.status, 30);
  if (!uuidPattern.test(id) || !allowedStatuses.has(status)) return json(res, 422, { error: "Choose a valid partner and approval status" });
  const update = await supabaseRequest(`b2b_agents?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ verification_status: status, updated_at: new Date().toISOString() }) });
  if (!update.ok) return json(res, 502, { error: "Partner status could not be updated" });
  const [agent] = await update.json();
  if (!agent) return json(res, 404, { error: "Partner application not found" });
  await supabaseRequest("audit_logs", { method: "POST", body: JSON.stringify({ actor: admin.user_id, action: "partner_verification_updated", entity_type: "b2b_agent", entity_id: id, metadata: { status, note: clean(req.body?.note, 1000) } }) });
  return json(res, 200, { agent: safeAgent(agent) });
}
