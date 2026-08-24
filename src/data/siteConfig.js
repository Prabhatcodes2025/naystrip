export const defaultSiteSettings = {
  brandName: "NaysTrip & Treks",
  shortBrand: "NaysTrip",
  tagline: "Leisure to Adventure",
  phone: "+91 8097132424",
  supportPhone: "+91 8097132424",
  whatsapp: "+91 8097132424",
  email: "hello@naystrip.com",
  trekEmail: "naystrek@gmail.com",
  cancellationEmail: "cancellation@naystrip.com",
  address: "EL146, Mahape, Navi Mumbai, Maharashtra, India",
  businessHours: "Hours confirmed when you call",
  footerText: "Mumbai-based trip planners for tailor-made holidays, group travel, Maharashtra circuits, treks, expeditions and corporate journeys.",
  social: {
    instagram: "https://www.instagram.com/naystrek?igsh=ZG9yenBiZXZ5bjA4",
    facebook: "https://www.facebook.com/share/18TqoKXvSo/",
    youtube: "https://www.youtube.com/channel/UCvktlYqp_dKUwN2EIgR0rsg",
    telegram: "https://t.me/trektoworld",
  },
  homepageCtaText: "Plan it your way",
};

export function getSiteSettings() {
  return defaultSiteSettings;
}

export async function loadSiteSettings(){const response=await fetch("/api/settings",{headers:{Accept:"application/json"}});const data=await response.json();if(!response.ok)throw new Error(data.error||"Settings unavailable");return {...defaultSiteSettings,...data.settings,social:{...defaultSiteSettings.social,...(data.settings?.social||{})}}}

export function whatsappHref(message = "") {
  const number = getSiteSettings().whatsapp.replace(/\D/g, "");
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export async function saveSiteSettings(settings) {
  const token = sessionStorage.getItem("naystrip_admin_session");
  const response = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` }, body: JSON.stringify(settings) });
  if (!response.ok) throw new Error("Settings could not be saved");
  return response.json();
}
