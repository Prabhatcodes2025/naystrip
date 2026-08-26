import { guard, json, supabaseRequest } from "../_shared.js";

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  const { email, password, name, phone, businessName, pan, portal } = req.body || {};
  if (!email || !password || password.length < 10 || !name || !phone || !["customer", "agent"].includes(portal)) return json(res, 422, { error: "Complete all required fields; passwords need at least 10 characters" });
  const normalizedPan = String(pan || "").trim().toUpperCase();
  if (portal === "agent" && (!businessName || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan))) return json(res, 422, { error: "Business name and a valid PAN (AAAAA9999A) are required" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || (portal === "agent" && !process.env.SUPABASE_SERVICE_ROLE_KEY)) return json(res, 503, { error: "Registration is being configured" });

  const auth = await fetch(`${process.env.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: process.env.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      data: { name, phone, business_name: businessName || null, pan: portal === "agent" ? normalizedPan : null, portal },
    }),
  });
  const data = await auth.json();
  if (!auth.ok) return json(res, 400, { error: data.msg || data.error_description || "Registration failed" });
  if (!data.user?.id || data.user.identities?.length === 0) return json(res, 409, { error: "An account with this email already exists" });

  if (portal === "agent") {
    const profile = await supabaseRequest(`b2b_agents?user_id=eq.${encodeURIComponent(data.user.id)}&select=id&limit=1`);
    const rows = profile.ok ? await profile.json() : [];
    if (!rows[0]) {
      const created = await supabaseRequest("b2b_agents", {
        method: "POST",
        body: JSON.stringify({
          user_id: data.user.id,
          business_name: String(businessName).trim(),
          contact_person: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          pan: normalizedPan,
          verification_status: "pending",
        }),
      });
      if (!created.ok) return json(res, 502, { error: "Account created, but the partner application could not be saved. Contact support with your email." });
    }
  }
  return json(res, 201, { user_id: data.user.id, confirmation_required: !data.session });
}
