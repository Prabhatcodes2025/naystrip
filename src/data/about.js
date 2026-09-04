// Company and team copy supplied in Team.docx.
export const services = [
  ["Tailor-Made Holidays", "Holidays designed around your interests, travel style, time, budget and expectations."],
  ["Group Tours (FIT & GIT)", "End-to-end arrangements for families, friends, clubs, institutions and special-interest groups."],
  ["Corporate Travel & MICE", "Corporate offsites, conferences, incentive travel, team outings and group movements."],
  ["Treks to Sahyadris", "Treks in the Sahyadris, in the Western Ghats."],
  ["Mountaineering & Rock Climbing", "Adventure activities along with basic training in mountaineering skills and rock climbing."],
  ["Treks & Expeditions to Himalayas", "Trekking adventures, Himalayan journeys and professionally managed expeditions."],
  ["Weekend Getaways", "Short escapes from Mumbai, Pune and across Maharashtra & Goa, including villas, resorts, sightseeing and adventure activities."],
  ["Ground Transportation", "Sedans, SUVs, Innova, Tempo Traveller, Urbania and buses for individual and group travel."],
  ["Hotels & Stays", "Handpicked accommodation based on destination, budget and traveller requirements."],
  ["B2B Travel Partnerships", "Customized packages, competitive partner rates, quotations and destination support for travel agents."],
  ["Visa Assistance", "Visa assistance and e-SIMs for our international travellers."],
  ["Travel & Adventure Insurance", "Help choosing suitable travel insurance options for holidays, adventure trips, trekking and expeditions."],
];

const trekLeaderBio = "Experienced in trek coordination, group management, route support, participant safety, and on-ground execution of trekking and adventure trips. Responsible for ensuring a smooth, safe, and enjoyable experience for trekkers throughout the journey.";

export const professionalTeam = [
  { name: "Lokesh Nikajoo", category: "Founder", role: "Travel Entrepreneur | Mountaineer | Explorer | Believer in Experiences", bio: "A trained mountaineer and passionate travel entrepreneur, Lokesh Nikajoo founded NaysTrip & Treks with a vision to combine destination expertise, personalized travel planning and adventure experiences. His business management and mountaineering background and years of exploring travel destinations shape the company's approach to responsible, well-planned and memorable journeys." },
  { name: "Nilesh Kshirsagar", category: "Co-Founder", role: "Finance & Business", bio: "With a Commerce background, Nilesh Kshirsagar brings a strong understanding of finance, business management and financial planning to NaysTrip & Treks. A passionate sports enthusiast and traveller, Nilesh combines his business acumen with a genuine love for exploration and experiences. As Co-Founder, he plays a vital role behind the scenes, helping build the financial discipline and business foundation required to grow NaysTrip & Treks sustainably." },
  { name: "Tushar Dalvi", role: "Sales & Marketing", bio: "Tushar Dalvi plays an important role in Sales & Marketing at NaysTrip & Treks, driving customer engagement, business development and brand outreach. He works closely with travellers and travel partners to understand their requirements and connect them with the right holiday packages, tailor-made journeys, group tours, corporate travel, treks and adventure experiences offered by NaysTrip & Treks." },
  { name: "Sandip Sonawne", role: "Trek Leader & Climber", bio: trekLeaderBio },
  { name: "Kailash", role: "Trek Leader & Climber", bio: trekLeaderBio },
  { name: "Sourabh Bhushan", role: "Technical Support", bio: "Responsible for technical operations, website support, system maintenance, troubleshooting and technology coordination to ensure smooth and reliable digital operations for NaysTrip & Treks." },
  { name: "Kapil G", role: "Tour Manager", bio: "Responsible for tour planning, itinerary coordination, group management, hotel and transport coordination, on-ground operations, and ensuring smooth execution of tours from departure to completion." },
  { name: "Vikas", role: "Transport & Logistics", bio: "Responsible for transportation management, vehicle coordination, driver coordination, route planning, and on-ground logistics to ensure smooth and reliable travel operations for NaysTrip & Treks." },
  { name: "Prakash", role: "Customer Support Executive", bio: "Responsible for customer communication, enquiry handling, booking assistance, travel updates, customer coordination, and post-booking support to ensure a smooth and positive travel experience with NaysTrip & Treks." },
];

export function resolveTeam(configured = []) {
  const normalize = (name) => name.trim().replace(/\s+/g, " ").toLowerCase();
  const published = configured.filter((member) => member.published && member.name);
  const names = new Set(professionalTeam.map((member) => normalize(member.name)));
  return [
    ...professionalTeam.map((member) => ({ ...member, photo: published.find((saved) => normalize(saved.name) === normalize(member.name))?.photo || "" })),
    ...published.filter((member) => {
      const name = normalize(member.name);
      if (names.has(name)) return false;
      names.add(name);
      return true;
    }),
  ];
}
