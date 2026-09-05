export const primaryPlacements = [
  { value: "tours-domestic", group: "Tours", label: "Domestic" },
  { value: "tours-international", group: "Tours", label: "International" },
  { value: "treks-sahyadri", group: "Treks & Expeditions", label: "Sahyadri" },
  { value: "treks-himalaya", group: "Treks & Expeditions", label: "Himalaya" },
  { value: "weekend-getaways", group: "Weekend Getaways", label: "Weekend Getaways" },
  { value: "travel-services", group: "Travel Services", label: "Travel Services" },
];

const legacyPlacementMap = {
  "tours-domestic-maharashtra": "tours-domestic",
  "tours-domestic-north-east": "tours-domestic",
  "tours-domestic-south-india": "tours-domestic",
};

export function packagePrimaryPlacement(item = {}) {
  const policies = item.policies || {};
  if (primaryPlacements.some(({ value }) => value === policies.primaryPlacement)) return policies.primaryPlacement;
  const placements = policies.placements || [];
  for (const value of placements) if (legacyPlacementMap[value]) return legacyPlacementMap[value];
  for (const { value } of primaryPlacements) if (placements.includes(value)) return value;
  const type = String(item.package_type || item.packageType || item.type || "").toLowerCase();
  if (type === "service") return "travel-services";
  if (["trek", "expedition"].includes(type)) return "treks-himalaya";
  return "tours-domestic";
}

export const categoryPages = {
  maharashtra: { title: "Maharashtra Packages", legacyPlacement: "tours-domestic-maharashtra", terms: ["maharashtra", "mumbai", "pune", "konkan", "nashik", "shirdi", "mahabaleshwar", "lonavala", "aurangabad", "sambhajinagar"] },
  "north-east": { title: "North East Packages", legacyPlacement: "tours-domestic-north-east", terms: ["north east", "northeast", "sikkim", "darjeeling", "assam", "meghalaya", "arunachal", "nagaland", "manipur", "mizoram", "tripura"] },
  "south-india": { title: "South India Packages", legacyPlacement: "tours-domestic-south-india", terms: ["south india", "kerala", "tamil nadu", "karnataka", "andhra", "telangana", "munnar", "coorg", "ooty"] },
  "weekend-getaways": { title: "Weekend Getaways", primaryPlacement: "weekend-getaways", terms: [] },
  "treks-expeditions": { title: "Treks & Expeditions", primaryPlacement: "treks-himalaya", terms: [] },
  "travel-services": { title: "Travel Services", primaryPlacement: "travel-services", terms: [] },
};

export function packageMatchesCategory(item, category, option) {
  const config = option ? { title: option.label, optionId: option.id, terms: [option.label, option.slug] } : categoryPages[category];
  if (!config) return false;
  const policies = item.policies || {};
  const placements = policies.placements || [];
  if (config.optionId && (policies.menuCategoryIds || []).includes(config.optionId)) return true;
  if (config.legacyPlacement && placements.includes(config.legacyPlacement)) return true;
  if (config.primaryPlacement && packagePrimaryPlacement(item) === config.primaryPlacement) return true;
  if (category === "maharashtra" && item.tripType === "Maharashtra") return true;
  if (category === "weekend-getaways" && Number(item.days) <= 4 && item.package_type !== "trek" && item.type !== "trek") return true;
  if (category === "treks-expeditions") return ["trek", "expedition"].includes(String(item.package_type || item.type || "").toLowerCase());
  const haystack = [item.title, item.destination, ...(item.destination_names || item.destinations || [])].join(" ").toLowerCase();
  return config.terms.some((term) => haystack.includes(term));
}
