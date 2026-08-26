import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";

const clean = (value, max = 5000) => String(value ?? "").trim().replace(/[<>]/g, "").slice(0, max);
const slugify = (value) => clean(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const mapBlog = (row) => ({
  id: row.id, slug: row.slug, title: row.title, subtitle: row.body?.subtitle || "",
  description: row.excerpt || "", excerpt: row.excerpt || "", content: row.body?.content || "",
  author: row.body?.author || row.author_name || "", image: row.cover_image || "",
  category: row.seo?.category || "Travel Guides", seoTitle: row.seo?.title || "",
  seoDescription: row.seo?.description || "", featured: Boolean(row.seo?.featured),
  published: row.status === "published", createdAt: row.created_at,
});
const mapStory = (row) => ({
  id: row.id, name: row.name, destination: row.destination, rating: row.rating,
  image: row.photo || "", testimonial: row.testimonial, published: row.status === "published",
  createdAt: row.created_at,
});

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  try {
    const resource = clean(req.query?.resource || req.body?.resource || "blogs", 20);
    const stories = resource === "stories";
    const table = stories ? "testimonials" : "blogs";
    if (req.method === "GET") {
      const response = await supabaseRequest(`${table}?select=*&order=created_at.desc`);
      if (!response.ok) return json(res, 502, { error: "Unable to load content" });
      return json(res, 200, { items: (await response.json()).map(stories ? mapStory : mapBlog) });
    }
    if (req.method === "POST" || req.method === "PATCH") {
      const item = req.body?.item || {};
      const record = stories ? {
        name: clean(item.name, 120), destination: clean(item.destination, 160),
        rating: Number(item.rating), photo: clean(item.image, 1000) || null,
        testimonial: clean(item.testimonial, 3000), status: item.published ? "published" : "draft",
        updated_at: new Date().toISOString(),
      } : {
        slug: slugify(item.slug || item.title), title: clean(item.title, 200),
        excerpt: clean(item.description || item.excerpt, 500),
        body: { subtitle: clean(item.subtitle, 300), content: clean(item.content, 15000), author: clean(item.author, 120) },
        author_name: clean(item.author, 120) || null, cover_image: clean(item.image, 1000) || null,
        status: item.published ? "published" : "draft",
        published_at: item.published ? new Date().toISOString() : null,
        seo: { category: clean(item.category, 100), title: clean(item.seoTitle, 200), description: clean(item.seoDescription, 500), featured: Boolean(item.featured) },
        updated_at: new Date().toISOString(),
      };
      if (stories && (!record.name || !record.destination || !record.testimonial || record.rating < 1 || record.rating > 5)) return json(res, 422, { error: "Complete all traveller story fields" });
      if (!stories && (!record.slug || !record.title || !record.body.content)) return json(res, 422, { error: "Title, slug and content are required" });
      const id = clean(item.id, 60);
      const response = await supabaseRequest(id ? `${table}?id=eq.${encodeURIComponent(id)}` : table, {
        method: id ? "PATCH" : "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record),
      });
      const rows = await response.json().catch(() => []);
      if (!response.ok) return json(res, 502, { error: rows?.message || "Unable to save content" });
      return json(res, 200, { item: (stories ? mapStory : mapBlog)(rows[0]) });
    }
    if (req.method === "DELETE") {
      const id = clean(req.query?.id, 60);
      if (!id) return json(res, 422, { error: "Content ID is required" });
      const response = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) return json(res, 502, { error: "Unable to delete content" });
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("admin_content_failed", error);
    return json(res, 500, { error: "Content service unavailable" });
  }
}
