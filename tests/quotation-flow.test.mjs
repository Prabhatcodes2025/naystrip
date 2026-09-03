import test from "node:test";
import assert from "node:assert/strict";
import quotations from "../server/admin/quotations.js";
import quotationActions from "../server/admin/quotation-actions.js";

const adminId = "11111111-1111-4111-8111-111111111111";
const roleId = "22222222-2222-4222-8222-222222222222";
const quoteId = "33333333-3333-4333-8333-333333333333";

const response = () => ({
  statusCode: 200,
  headers: {},
  status(code) { this.statusCode = code; return this; },
  setHeader(name, value) { this.headers[name] = value; return this; },
  end(body) { this.body = body; },
});

async function invoke(handler, method, body) {
  const res = response();
  await handler({ method, body, headers: { authorization: "Bearer admin-session" } }, res);
  return { status: res.statusCode, data: JSON.parse(res.body) };
}

test("admin can create, list, reopen, edit and preview a quotation", async (t) => {
  const originalFetch = global.fetch;
  const originalEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
  };
  process.env.SUPABASE_URL = "https://db.example";
  process.env.SUPABASE_ANON_KEY = "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
  process.env.PUBLIC_SITE_URL = "https://www.naystrip.com";

  let quote;
  let lines = [];
  global.fetch = async (url, options = {}) => {
    const value = String(url);
    if (value.includes("/auth/v1/user")) return Response.json({ id: adminId, email: "admin@naystrip.com" });
    if (value.includes("/rest/v1/admin_users?")) return Response.json([{ user_id: adminId, display_name: "Admin", role_id: roleId }]);
    if (value.includes("/rest/v1/roles?")) return Response.json([{ id: roleId, name: "Super Admin" }]);
    if (value.includes("/rest/v1/quotation_lines?") && options.method === "DELETE") {
      lines = [];
      return new Response(null, { status: 204 });
    }
    if (value.endsWith("/rest/v1/quotation_lines") && options.method === "POST") {
      lines = JSON.parse(options.body);
      return new Response(null, { status: 201 });
    }
    if (value.includes("/rest/v1/quotations?") && options.method === "DELETE") {
      quote = undefined;
      return new Response(null, { status: 204 });
    }
    if (value.includes("/rest/v1/quotations?") && options.method === "PATCH") {
      quote = { ...quote, ...JSON.parse(options.body) };
      return options.headers?.Prefer ? Response.json([quote]) : new Response(null, { status: 204 });
    }
    if (value.endsWith("/rest/v1/quotations") && options.method === "POST") {
      quote = { id: quoteId, status: "draft", currency: "INR", ...JSON.parse(options.body) };
      return Response.json([quote], { status: 201 });
    }
    if (value.includes("/rest/v1/quotations?")) return Response.json(quote ? [{ ...quote, lines }] : []);
    throw new Error(`Unexpected request: ${value}`);
  };

  t.after(() => {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const form = {
    customerName: "Test Traveller",
    title: "Custom travel proposal",
    travellerCount: 2,
    discount: 0,
    taxPercent: 5,
    advanceRequired: 1000,
    lines: [{ description: "Package services", quantity: 1, unitPrice: 10000 }],
  };
  const created = await invoke(quotations, "POST", form);
  assert.equal(created.status, 201);
  assert.match(created.data.quotation.reference, /^NTQ-\d{8}-[A-Z0-9]{6}$/);
  assert.equal(created.data.quotation.lines.length, 1);

  const listed = await invoke(quotations, "GET");
  assert.equal(listed.status, 200);
  assert.equal(listed.data.quotations[0].id, quoteId);
  assert.equal(listed.data.quotations[0].lines.length, 1);

  const edited = await invoke(quotations, "PATCH", { ...form, id: quoteId, title: "Updated proposal" });
  assert.equal(edited.status, 200);
  assert.equal(edited.data.quotation.title, "Updated proposal");

  const preview = await invoke(quotationActions, "POST", { id: quoteId, action: "preview" });
  assert.equal(preview.status, 200);
  assert.match(preview.data.url, /^https:\/\/www\.naystrip\.com\/quotation\/NTQ-/);
});
