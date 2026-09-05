export const defaultHeaderMenuOptions = [
  { id: "dom-maharashtra", section: "tours", subgroup: "domestic", label: "Maharashtra", slug: "maharashtra", target: "/packages/maharashtra", displayOrder: 10, published: true },
  { id: "dom-north-east", section: "tours", subgroup: "domestic", label: "North East", slug: "north-east", target: "/packages/north-east", displayOrder: 20, published: true },
  { id: "dom-south-india", section: "tours", subgroup: "domestic", label: "South India", slug: "south-india", target: "/packages/south-india", displayOrder: 30, published: true },
  { id: "dom-goa", section: "tours", subgroup: "domestic", label: "Goa", slug: "goa", target: "/packages/goa", displayOrder: 40, published: true },
  { id: "dom-himachal", section: "tours", subgroup: "domestic", label: "Himachal", slug: "himachal", target: "/packages/himachal", displayOrder: 50, published: true },
  { id: "dom-leh-ladakh", section: "tours", subgroup: "domestic", label: "Leh Ladakh", slug: "leh-ladakh", target: "/packages/leh-ladakh", displayOrder: 60, published: true },
  { id: "dom-uttarakhand", section: "tours", subgroup: "domestic", label: "Uttarakhand", slug: "uttarakhand", target: "/packages/uttarakhand", displayOrder: 70, published: true },
  ...["Indonesia", "Bali", "Australia", "Nepal", "Sri Lanka", "Thailand"].map((label, index) => ({ id: `intl-${label.toLowerCase().replace(/\s+/g,"-")}`, section: "tours", subgroup: "international", label, slug: label.toLowerCase().replace(/\s+/g,"-"), target: `/packages/${label.toLowerCase().replace(/\s+/g,"-")}`, displayOrder: (index + 1) * 10, published: true })),
  ...["Kalsubai", "Harishchandragad", "Sandhan Valley", "Sondai Fort", "Kalavantin Durg", "Prabalgad", "Garbett Plateau"].map((label, index) => ({ id: `sahyadri-${label.toLowerCase().replace(/\s+/g,"-")}`, section: "treks", subgroup: "sahyadri", label, slug: label.toLowerCase().replace(/\s+/g,"-"), target: `/packages/${label.toLowerCase().replace(/\s+/g,"-")}`, displayOrder: (index + 1) * 10, published: true })),
  { id: "himalaya-treks", section: "treks", subgroup: "himalaya", label: "Himalayan Treks", slug: "himalayan-treks", target: "/treks", displayOrder: 10, published: true },
  { id: "himalaya-expeditions", section: "treks", subgroup: "himalaya", label: "Himalayan Expeditions", slug: "himalayan-expeditions", target: "/expeditions", displayOrder: 20, published: true },
  ...["Lonavala", "Igatpuri", "Karjat", "Bhandardara Lake Camping", "Malshej Ghat", "Alibaug", "Mahabaleshwar", "Matheran", "Pawna Camping"].map((label, index) => ({ id: `weekend-${label.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`, section: "weekends", subgroup: "", label, slug: label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""), target: `/packages/${label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`, displayOrder: (index + 1) * 10, published: true })),
  ...[["Transportation","/transport"],["Visa Assistance","/custom-trip?service=visa"],["Car Rental","/custom-trip?service=carRental"],["E-Sim","/custom-trip?service=eSim"],["Insurance Assistance","/custom-trip?service=insurance"],["Corporate Tours","/corporate-travel"],["Custom Holiday","/custom-trip"],["Group & Family Trips","/custom-trip?tripType=Friends%20group"],["School & College Tours","/custom-trip?tripType=School%20or%20college"]].map(([label,target], index) => ({ id: `service-${label.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`, section: "services", subgroup: "", label, slug: label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""), target, displayOrder: (index + 1) * 10, published: true })),
];

export const defaultSiteSettings = {
  brandName: "NaysTrip & Treks",
  shortBrand: "NaysTrip",
  tagline: "Leisure to Adventure",
  phone: "+91 8097132424",
  supportPhone: "+91 8097132424",
  whatsapp: "+91 8097132424",
  email: "hello@naystrip.com",
  website: "https://www.naystrip.com",
  trekEmail: "naystrek@gmail.com",
  cancellationEmail: "cancellation@naystrip.com",
  address: "EL146, Mahape, Navi Mumbai, Maharashtra, India",
  businessLegalName: "",
  gstNumber: "",
  invoiceAddress: "",
  businessHours: "Hours confirmed when you call",
  footerText: "Mumbai-based trip planners for tailor-made holidays, group travel, Maharashtra circuits, treks, expeditions and corporate journeys.",
  social: {
    instagram: "https://www.instagram.com/naystrek?igsh=ZG9yenBiZXZ5bjA4",
    facebook: "https://www.facebook.com/share/18TqoKXvSo/",
    youtube: "https://www.youtube.com/channel/UCvktlYqp_dKUwN2EIgR0rsg",
    telegram: "https://t.me/trektoworld",
  },
  homepageCtaText: "Plan it your way",
  monthlyPicks: [],
  events: [],
  headerMenuOptions: defaultHeaderMenuOptions,
  topTripSlugs: [],
  topTrekSlugs: [],
  trustMetrics: {
    packageCount: "",
    googleRating: "",
    googleReviewCount: "",
    googleReviewUrl: "",
    happyTravellers: "",
    support24x7: false,
    msmeRegistration: "",
    nidhiRegistration: "",
  },
  team: [],
  socialInitiative: { title: "", image: "", description: "", link: "", published: false },
  b2bDefaultMarkupPercent: 10,
};

export function getSiteSettings() {
  return defaultSiteSettings;
}

export async function loadSiteSettings(){const response=await fetch("/api/settings",{headers:{Accept:"application/json"}});const data=await response.json();if(!response.ok)throw new Error(data.error||"Settings unavailable");return {...defaultSiteSettings,...data.settings,social:{...defaultSiteSettings.social,...(data.settings?.social||{})},monthlyPicks:Array.isArray(data.settings?.monthlyPicks)?data.settings.monthlyPicks:[],events:Array.isArray(data.settings?.events)?data.settings.events:[],headerMenuOptions:Array.isArray(data.settings?.headerMenuOptions)&&data.settings.headerMenuOptions.length?data.settings.headerMenuOptions:defaultHeaderMenuOptions}}

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
