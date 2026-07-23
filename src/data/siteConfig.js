export const defaultSiteSettings = {
  brandName: "Altiora Journeys",
  tagline: "Journeys Designed Around Your Dreams",
  phone: "+91 98765 43210",
  supportPhone: "+91 1800 202 4040",
  email: "hello@altiorajourneys.com",
  whatsapp: "+919876543210",
  address: "4th Floor, Sapphire Business Park, MG Road, Bengaluru, Karnataka 560001",
  businessHours: "Mon – Sat, 9:00 AM – 8:00 PM IST",
  footerText:
    "Altiora Journeys crafts thoughtfully designed holidays, treks and expeditions across India and the world — backed by real travel experts and 24/7 support.",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
  },
  homepageCtaText: "Your Next Great Story Starts Here",
};

export function getSiteSettings() {
  try {
    const raw = localStorage.getItem("altiora_site_settings");
    if (raw) return { ...defaultSiteSettings, ...JSON.parse(raw) };
  } catch {
    /* noop */
  }
  return defaultSiteSettings;
}

export function saveSiteSettings(settings) {
  localStorage.setItem("altiora_site_settings", JSON.stringify(settings));
}
