import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";
import { clean, money, uuidPattern } from "../_validation.js";

const slugify = (value) =>
  clean(value, 150)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const packageRecord = (body) => {
  const requestedMode=["enquiry_only","flexible_date","fixed_departure"].includes(body.bookingMode)?body.bookingMode:null;
  const mode=requestedMode||(body.bookingEnabled&&!body.customEnquiryOnly?"flexible_date":"enquiry_only");
  return ({
  slug: slugify(body.slug || body.title),
  title: clean(body.title, 200),
  package_type: clean(body.packageType || "tour", 30),
  destination_names: (body.destinations || [])
    .map((item) => clean(item, 80))
    .filter(Boolean)
    .slice(0, 20),
  nights: Math.max(0, Number(body.nights || 0)),
  days: Math.max(1, Number(body.days || 1)),
  overview: clean(body.overview, 10000),
  short_description: clean(body.shortDescription, 500),
  route: clean(body.route, 1000),
  highlights: (body.highlights || [])
    .map((item) => clean(item, 300))
    .filter(Boolean),
  start_point: clean(body.startPoint, 200),
  end_point: clean(body.endPoint, 200),
  hero_image: clean(body.heroImage, 1000),
  gallery: (body.gallery || [])
    .map((item) => clean(item, 1000))
    .filter(Boolean),
  price_from:
    body.priceFrom === "" || body.priceFrom == null
      ? null
      : money(body.priceFrom),
  tax_percent: money(body.taxPercent),
  advance_percent: money(body.advancePercent || 50),
  booking_enabled: mode !== "enquiry_only",
  custom_enquiry_only: mode === "enquiry_only",
  featured: Boolean(body.featured),
  status: ["draft", "published", "archived"].includes(body.status)
    ? body.status
    : "draft",
  policies: { ...(body.policies || {}), booking_mode: mode },
  seo: body.seo || {},
  source: "admin",
  });
};
const bookingConfigurationError=(record)=>record.status==="published"&&record.policies.booking_mode==="flexible_date"&&record.price_from==null?"A published flexible-date package needs an approved starting price before online booking can be enabled":null;
const upstreamError=async(response,fallback)=>{const body=await response.text();try{const error=body?JSON.parse(body):{};return clean(error.message||error.details||error.hint,500)||fallback}catch{return fallback}};
async function availableSlug(base){let slug=base;for(let suffix=2;suffix<1000;suffix++){const response=await supabaseRequest(`packages?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`);if(!response.ok)throw new Error(await upstreamError(response,"Package slug could not be checked"));const rows=await response.json();if(!rows.length)return slug;slug=`${base}-${suffix}`}throw new Error("Unable to generate a unique package slug")}

async function replaceChildren(packageId, body) {
  await supabaseRequest(`package_itinerary_days?package_id=eq.${packageId}`, {
    method: "DELETE",
  });
  await supabaseRequest(`package_items?package_id=eq.${packageId}`, {
    method: "DELETE",
  });
  if (body.itinerary?.length) {
    const days = body.itinerary.map((day, index) => ({
      package_id: packageId,
      day_number: index + 1,
      title: clean(day.title, 300),
      description: clean(day.description, 5000),
      meals: clean(day.meals, 300) || null,
      stay: clean(day.stay, 300) || null,
      transfers: clean(day.transfers, 500) || null,
      activities: (day.activities || []).map((item) => clean(item, 300)),
      sort_order: index,
    }));
    await supabaseRequest("package_itinerary_days", {
      method: "POST",
      body: JSON.stringify(days),
    });
  }
  const items = [];
  for (const type of ["inclusion", "exclusion", "note", "faq"])
    for (const [index, value] of (body[`${type}s`] || []).entries())
      items.push({
        package_id: packageId,
        item_type: type,
        body: clean(value, 2000),
        sort_order: index,
      });
  if (items.length)
    await supabaseRequest("package_items", {
      method: "POST",
      body: JSON.stringify(items),
    });
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  try {
    if (req.method === "GET") {
      const response = await supabaseRequest(
        "packages?deleted_at=is.null&select=*,itinerary:package_itinerary_days(*),items:package_items(*),departures:package_departures(*),addons:package_addons(*)&order=updated_at.desc",
      );
      return response.ok
        ? json(res, 200, { packages: await response.json() })
        : json(res, 502, { error: "Packages could not be loaded" });
    }
    const body = req.body || {};
    if (req.method === "POST" && body.action === "clone") {
      if (!uuidPattern.test(body.id))
        return json(res, 422, { error: "Invalid package" });
      const sourceResponse = await supabaseRequest(
        `packages?id=eq.${body.id}&select=*,itinerary:package_itinerary_days(*),items:package_items(*)&limit=1`,
      );
      const [row] = await sourceResponse.json();
      if (!row) return json(res, 404, { error: "Package not found" });
      const {
        id: _id,
        created_at: _createdAt,
        updated_at: _updatedAt,
        itinerary,
        items,
        ...source
      } = row;
      source.slug = `${source.slug}-copy-${crypto.randomUUID().slice(0, 4)}`;
      source.title = `${source.title} (Copy)`;
      source.status = "draft";
      const inserted = await supabaseRequest("packages", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(source),
      });
      const [created] = await inserted.json();
      await replaceChildren(created.id, {
        itinerary: (itinerary || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((day) => ({ ...day })),
        inclusions: (items || [])
          .filter((item) => item.item_type === "inclusion")
          .map((item) => item.body),
        exclusions: (items || [])
          .filter((item) => item.item_type === "exclusion")
          .map((item) => item.body),
        notes: (items || [])
          .filter((item) => item.item_type === "note")
          .map((item) => item.body),
        faqs: (items || [])
          .filter((item) => item.item_type === "faq")
          .map((item) => item.body),
      });
      return json(res, 201, { package: created });
    }
    if (req.method === "POST") {
      const record = packageRecord(body);
      if (!record.title || !record.slug)
        return json(res, 422, { error: "Title and slug are required" });
      record.slug=await availableSlug(record.slug);
      const configurationError=bookingConfigurationError(record);
      if(configurationError)return json(res,422,{error:configurationError});
      const inserted = await supabaseRequest("packages", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(record),
      });
      if (!inserted.ok)
        return json(res, inserted.status===409?409:502, { error: await upstreamError(inserted,"Package could not be created") });
      const rows=await inserted.json().catch(()=>[]);const created=rows[0];
      if(!created?.id)return json(res,502,{error:"Package was not returned after creation"});
      await replaceChildren(created.id, body);
      return json(res, 201, { package: created });
    }
    if (req.method === "PATCH") {
      if (!uuidPattern.test(body.id))
        return json(res, 422, { error: "Invalid package" });
      const record=packageRecord(body);
      const configurationError=bookingConfigurationError(record);
      if(configurationError)return json(res,422,{error:configurationError});
      const updated = await supabaseRequest(`packages?id=eq.${body.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          ...record,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!updated.ok)
        return json(res, 502, { error: "Package could not be updated" });
      await replaceChildren(body.id, body);
      return json(res, 200, { package: (await updated.json())[0] });
    }
    if (req.method === "DELETE") {
      if (!uuidPattern.test(req.query?.id))
        return json(res, 422, { error: "Invalid package" });
      await supabaseRequest(`packages?id=eq.${req.query.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "archived",
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      return json(res, 200, { archived: true });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("admin_packages_failed", error);
    return json(res, 500, { error: "Package service unavailable" });
  }
}
