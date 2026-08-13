import { requireAdmin } from "../_admin.js";
import { json } from "../_shared.js";

const MAX_BYTES = 5 * 1024 * 1024;
const allowed = new Map([
  ["image/jpeg", { extension: "jpg", valid: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }],
  ["image/png", { extension: "png", valid: (b) => b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) }],
  ["image/webp", { extension: "webp", valid: (b) => b.subarray(0,4).toString() === "RIFF" && b.subarray(8,12).toString() === "WEBP" }],
]);
export function validMedia(type, bytes){const rule=allowed.get(type);return Boolean(rule&&bytes?.length&&rule.valid(bytes))}

const safeScope = (value) => String(value || "general").toLowerCase().replace(/[^a-z0-9/-]+/g, "-").replace(/\.{2,}|^\/+|\/+$/g, "").slice(0, 160) || "general";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const type = String(req.headers["content-type"] || "").split(";")[0].toLowerCase();
  const rule = allowed.get(type);
  if (!rule) return json(res, 415, { error: "Choose a JPG, PNG or WebP image" });
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) return json(res, 413, { error: "Images must be 5 MB or smaller" });
    chunks.push(Buffer.from(chunk));
  }
  const bytes = Buffer.concat(chunks);
  if (!validMedia(type,bytes)) return json(res, 415, { error: "The file contents do not match the selected image type" });
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return json(res, 503, { error: "Media storage is not configured" });
  const scope = safeScope(req.headers["x-media-scope"]);
  const objectPath = `${scope}/${Date.now()}-${crypto.randomUUID()}.${rule.extension}`;
  const upload = await fetch(`${supabaseUrl}/storage/v1/object/site-media/${objectPath}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": type, "x-upsert": "false", "Cache-Control": "31536000" },
    body: bytes,
  });
  if (!upload.ok) {
    const detail = await upload.text();
    console.error("admin_media_upload_failed", upload.status, detail.slice(0, 400));
    return json(res, 502, { error: "Image upload failed. Confirm the site-media bucket exists." });
  }
  return json(res, 201, { path: objectPath, url: `${supabaseUrl}/storage/v1/object/public/site-media/${objectPath}`, size, contentType: type });
}
