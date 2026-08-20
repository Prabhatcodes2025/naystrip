import { useEffect } from "react";

const upsert = (selector, attr, value) => { let tag = document.querySelector(selector); if (!tag) { tag = document.createElement("meta"); for (const [key, entry] of Object.entries(attr)) tag.setAttribute(key, entry); document.head.appendChild(tag); } tag.setAttribute("content", value); };
let siteUrlPromise;
const runtimeSiteUrl = () => {
  if (!siteUrlPromise) siteUrlPromise = fetch("/api/config", { headers: { Accept: "application/json" } }).then((response) => response.ok ? response.json() : {}).then((data) => data.siteUrl || window.location.origin).catch(() => window.location.origin);
  return siteUrlPromise;
};

export default function Seo({ title, description }) {
  useEffect(() => {
    let active = true;
    const pageTitle = title || "NaysTrip & Treks";
    const summary = description || "Tours, treks, expeditions and custom holidays from Mumbai.";
    document.title = pageTitle;
    upsert('meta[name="description"]', { name: "description" }, summary);
    upsert('meta[property="og:title"]', { property: "og:title" }, pageTitle);
    upsert('meta[property="og:description"]', { property: "og:description" }, summary);
    upsert('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsert('meta[name="twitter:title"]', { name: "twitter:title" }, pageTitle);
    upsert('meta[name="twitter:description"]', { name: "twitter:description" }, summary);
    runtimeSiteUrl().then((base) => {
      if (!active) return;
      const origin = String(base).replace(/\/$/, "");
      const image = `${origin}/og.png`;
      upsert('meta[property="og:image"]', { property: "og:image" }, image);
      upsert('meta[name="twitter:image"]', { name: "twitter:image" }, image);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = `${origin}${window.location.pathname}`;
    });
    return () => { active = false; };
  }, [title, description]);
  return null;
}
