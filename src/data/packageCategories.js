export const packagePlacements = [
  { value: "weekend-getaways", label: "Weekend Getaways" },
  { value: "treks-expeditions", label: "Treks & Expeditions" },
  { value: "tours-domestic", label: "Tours → Domestic" },
  { value: "tours-domestic-maharashtra", label: "Tours → Domestic → Maharashtra" },
  { value: "tours-domestic-north-east", label: "Tours → Domestic → North East" },
  { value: "tours-domestic-south-india", label: "Tours → Domestic → South India" },
  { value: "tours-international", label: "Tours → International" },
  { value: "travel-services", label: "Travel Services" },
];

export const categoryPages = {
  maharashtra: { title: "Maharashtra Packages", placement: "tours-domestic-maharashtra", terms: ["maharashtra", "mumbai", "pune", "konkan", "nashik", "shirdi", "mahabaleshwar", "lonavala", "aurangabad", "sambhajinagar"] },
  "north-east": { title: "North East Packages", placement: "tours-domestic-north-east", terms: ["north east", "northeast", "sikkim", "darjeeling", "assam", "meghalaya", "arunachal", "nagaland", "manipur", "mizoram", "tripura"] },
  "south-india": { title: "South India Packages", placement: "tours-domestic-south-india", terms: ["south india", "kerala", "tamil nadu", "karnataka", "andhra", "telangana", "munnar", "coorg", "ooty"] },
  "weekend-getaways": { title: "Weekend Getaways", placement: "weekend-getaways", terms: [] },
  "treks-expeditions": { title: "Treks & Expeditions", placement: "treks-expeditions", terms: [] },
  "travel-services": { title: "Travel Services", placement: "travel-services", terms: [] },
};

export function packageMatchesCategory(item, category) {
  const config = categoryPages[category];
  if (!config) return false;
  const placements = item.policies?.placements || [];
  if (placements.includes(config.placement)) return true;
  if (category === "maharashtra" && item.tripType === "Maharashtra") return true;
  if (category === "weekend-getaways" && Number(item.days) <= 4 && item.package_type !== "trek" && item.type !== "trek") return true;
  if (category === "treks-expeditions") return ["trek", "expedition"].includes(String(item.package_type || item.type || "").toLowerCase());
  const haystack = [item.title, item.destination, ...(item.destination_names || item.destinations || [])].join(" ").toLowerCase();
  return config.terms.some((term) => haystack.includes(term));
}
