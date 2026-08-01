

export const services = [
  { icon: "Plane", title: "Flights", desc: "Best fares across domestic and international routes, booked and managed for you." },
  { icon: "Hotel", title: "Hotels", desc: "Verified stays from boutique homestays to 5-star luxury resorts." },
  { icon: "Car", title: "Taxi", desc: "Reliable, well-maintained vehicles with experienced local drivers." },
  { icon: "Map", title: "Tour Packages", desc: "Curated, ready-to-book itineraries across India and abroad." },
  { icon: "Home", title: "Domestic Holidays", desc: "Handpicked journeys across India's mountains, coasts and cities." },
  { icon: "Calendar", title: "Fixed Departures", desc: "Join a small group on a set date — no planning required." },
  { icon: "Globe", title: "International Holidays", desc: "Seamless overseas trips with visa support and local experts." },
  { icon: "ShieldCheck", title: "Travel Insurance", desc: "Comprehensive coverage for a worry-free journey." },
];

export const holidayCategories = [
  { slug: "adventure", name: "Adventure", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80", count: 42 },
  { slug: "heritage", name: "Heritage", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80", count: 27 },
  { slug: "honeymoon", name: "Honeymoon", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", count: 35 },
  { slug: "family", name: "Family", image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80", count: 51 },
  { slug: "religious", name: "Religious", image: "https://images.unsplash.com/photo-1561361058-c24cecda86a4?auto=format&fit=crop&w=800&q=80", count: 18 },
  { slug: "wildlife", name: "Wildlife", image: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80", count: 14 },
  { slug: "luxury", name: "Luxury", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", count: 23 },
  { slug: "weekend-getaways", name: "Weekend Getaways", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", count: 38 },
];

const _illustrativeFixedDepartures = [
  { id: "fd1", type: "Tour", destination: "Leh Ladakh", date: "12 Aug 2026", duration: "8 Days", seatsLeft: 6, price: 29999 },
  { id: "fd2", type: "Tour", destination: "Kashmir", date: "20 Aug 2026", duration: "6 Days", seatsLeft: 9, price: 24999 },
  { id: "fd3", type: "Trek", destination: "Kedarkantha", date: "26 Dec 2026", duration: "6 Days", seatsLeft: 4, price: 12999 },
  { id: "fd4", type: "Trek", destination: "Kashmir Great Lakes", date: "08 Aug 2026", duration: "8 Days", seatsLeft: 7, price: 21999 },
  { id: "fd5", type: "Expedition", destination: "Friendship Peak", date: "15 May 2026", duration: "7 Days", seatsLeft: 3, price: 34999 },
  { id: "fd6", type: "Volvo Package", destination: "Manali (Volvo)", date: "Every Friday", duration: "5 Days", seatsLeft: 12, price: 8999 },
  { id: "fd7", type: "Tour", destination: "Spiti Valley", date: "02 Sep 2026", duration: "7 Days", seatsLeft: 5, price: 26999 },
  { id: "fd8", type: "Volvo Package", destination: "Shimla (Volvo)", date: "Every Saturday", duration: "4 Days", seatsLeft: 15, price: 7499 },
];
export const fixedDepartures = [];

export const weekendGetaways = [
  { name: "Lonavala", driveTime: "3 hrs from Mumbai", duration: "2 Days / 1 Night", price: 4999, image: "https://images.unsplash.com/photo-1580289143186-3939fca10dcf?auto=format&fit=crop&w=800&q=80" },
  { name: "Coorg", driveTime: "5 hrs from Bengaluru", duration: "3 Days / 2 Nights", price: 8499, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80" },
  { name: "Rishikesh", driveTime: "6 hrs from Delhi", duration: "2 Days / 1 Night", price: 5999, image: "https://images.unsplash.com/photo-1626621341561-3a0a659a5e5a?auto=format&fit=crop&w=800&q=80" },
  { name: "Alibaug", driveTime: "2 hrs by ferry from Mumbai", duration: "2 Days / 1 Night", price: 5499, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
];

export const corporateServices = [
  { title: "Corporate Tours", desc: "End-to-end planning for company offsites and business travel with dedicated account managers." },
  { title: "Incentive Travel", desc: "Reward top performers with bespoke experiences designed to motivate and inspire." },
  { title: "MICE", desc: "Meetings, incentives, conferences and exhibitions handled with precision logistics." },
  { title: "Team Retreats", desc: "Curated retreats that balance team-building with genuine relaxation." },
  { title: "Conference Travel", desc: "Seamless group travel, accommodation and on-ground support for conferences." },
];

export const transportFleet = [
  { name: "Tempo Traveller", seats: "12–17 Seater", luggage: "Generous boot + roof carrier", ac: true, bestFor: "Group tours and family trips", priceText: "Starting ₹18/km", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
  { name: "Mercedes Urbania", seats: "13–20 Seater", luggage: "Large under-body storage", ac: true, bestFor: "Premium corporate & MICE travel", priceText: "Starting ₹32/km", image: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=800&q=80" },
  { name: "Toyota Innova", seats: "6–7 Seater", luggage: "Medium boot space", ac: true, bestFor: "Hill station and airport transfers", priceText: "Starting ₹14/km", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80" },
  { name: "Maruti Ertiga", seats: "6 Seater", luggage: "Compact boot space", ac: true, bestFor: "Small family trips", priceText: "Starting ₹11/km", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80" },
  { name: "Premium Sedan", seats: "4 Seater", luggage: "Standard boot space", ac: true, bestFor: "Couples and business travel", priceText: "Starting ₹10/km", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
  { name: "SUV (XUV700 / Safari)", seats: "6–7 Seater", luggage: "Large boot space", ac: true, bestFor: "Hill terrain and off-beat routes", priceText: "Starting ₹16/km", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" },
  { name: "Luxury Bus", seats: "35–45 Seater", luggage: "Under-carriage cargo hold", ac: true, bestFor: "Large groups and Volvo trips", priceText: "On request", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80" },
  { name: "Caravan", seats: "4–6 Seater (with beds)", luggage: "Built-in storage", ac: true, bestFor: "Road trips and offbeat camping", priceText: "Starting ₹25/km", image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80" },
];

const _illustrativeTestimonials = [
  { name: "Ananya & Rohit Sharma", destination: "Kashmir Honeymoon", rating: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", text: "Every single detail was thought through — from the houseboat upgrade to the Gulmarg timing. It genuinely felt like a curated experience, not a package." },
  { name: "Vikram Malhotra", destination: "Ladakh Road Trip", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", text: "Our driver's knowledge of the passes and the acclimatisation plan made all the difference. No altitude issues for anyone in our group of 8." },
  { name: "Priya Nair", destination: "Kerala Backwaters", rating: 5, image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80", text: "The houseboat was even better than the photos. Our kids still talk about the sunset on the backwaters." },
  { name: "Karan Mehta", destination: "Dubai Luxury Escape", rating: 4.8, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80", text: "Visa, hotel, desert safari — all handled without a single hiccup. Great value for a five-star itinerary." },
  { name: "Sneha Kulkarni", destination: "Kedarkantha Trek", rating: 5, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80", text: "First snow trek and I felt completely safe throughout. The trek leader was fantastic with beginners." },
  { name: "Arjun & Family", destination: "Goa Family Holiday", rating: 4.9, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", text: "Relaxed pace, great resort, and the kids loved the pool. Exactly what we needed for a family break." },
];
export const testimonials = [];

const _illustrativeGoogleReviews = [
  { name: "Rahul Verma", rating: 5, text: "Booked our Spiti trip through NaysTrip — smooth planning and genuinely helpful support throughout.", date: "2 weeks ago" },
  { name: "Meera Iyer", rating: 5, text: "Best travel agency we've used. The custom itinerary for our Europe trip was spot on.", date: "1 month ago" },
  { name: "Sandeep Rao", rating: 4, text: "Great experience overall, minor delay in one transfer but the team resolved it quickly.", date: "1 month ago" },
  { name: "Divya Prakash", rating: 5, text: "Our corporate offsite to Coorg was flawlessly organised. Will definitely book again.", date: "2 months ago" },
];
export const googleReviews = [];

export const blogs = [
  {
    slug: "best-time-visit-ladakh",
    title: "The Best Time to Visit Ladakh: A Season-by-Season Guide",
    category: "Travel Guides",
    image: "https://images.unsplash.com/photo-1585116938581-6f7ad9fbb7ea?auto=format&fit=crop&w=1000&q=80",
    excerpt: "From snow-bound winters to the open-road months of summer, here's how to pick the right season for your Ladakh trip.",
    date: "2026-06-02",
    relatedDestination: "leh-ladakh",
    content:
      "Ladakh transforms dramatically across the seasons. Summer (June–September) is when the high passes open and most travellers visit, offering the classic Pangong-Nubra circuit. Winter brings the famous Chadar trek across the frozen Zanskar river, but with extreme cold and logistical challenges. Shoulder months of May and October offer fewer crowds but a real chance of road closures. For first-time visitors, June through early September remains the safest, most rewarding window — with July and August offering the most stable weather across all major routes.",
  },
  {
    slug: "packing-list-himalayan-trek",
    title: "The Complete Packing List for Your First Himalayan Trek",
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=80",
    excerpt: "Everything you need — and nothing you don't — for a comfortable, safe trekking experience in the Himalayas.",
    date: "2026-05-18",
    relatedDestination: null,
    content:
      "A well-packed bag can make or break a trek. Start with layering: a moisture-wicking base layer, an insulating fleece, and a waterproof-breathable outer shell. Footwear matters more than almost anything else — broken-in trekking boots with ankle support are non-negotiable. Don't forget a headlamp with spare batteries, a reusable water bottle with purification tablets, and a basic first-aid kit. Pack light: most treks limit porter loads to around 9kg of personal items, so prioritise function over comfort items you can live without.",
  },
  {
    slug: "kashmir-houseboat-guide",
    title: "Sleeping on Dal Lake: A Guide to Kashmir's Houseboats",
    category: "Destinations",
    image: "https://images.unsplash.com/photo-1611348586840-ea9872d33411?auto=format&fit=crop&w=1000&q=80",
    excerpt: "What to expect, how to choose a category, and why a houseboat stay is a Kashmir trip essential.",
    date: "2026-04-30",
    relatedDestination: "kashmir",
    content:
      "Houseboats on Dal and Nigeen Lake range from simple deluxe categories to ornately carved luxury vessels with private sundecks. Most include all meals prepared on board, and a shikara transfer to reach the boat is part of the experience itself. Nigeen Lake tends to be quieter than Dal, while Dal offers easier access to the floating markets and Mughal Gardens. Booking at least a month ahead during peak season (April–July) is strongly recommended, as the best-rated boats fill up quickly.",
  },
  {
    slug: "goa-beyond-beaches",
    title: "Goa Beyond the Beaches: Hidden Spots Worth Exploring",
    category: "Destinations",
    image: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1000&q=80",
    excerpt: "Waterfalls, spice plantations and quiet churches — the side of Goa most visitors miss.",
    date: "2026-04-10",
    relatedDestination: "goa",
    content:
      "While Goa's beaches deservedly get the spotlight, the state's interior holds some of its best experiences. Dudhsagar Falls, a four-tiered cascade on the Goa-Karnataka border, is best visited by jeep safari during monsoon and early winter. The Old Goa churches — a UNESCO World Heritage Site — offer a quieter, more reflective side of the state's Portuguese heritage. For a full day off the coast, a spice plantation tour near Ponda pairs a guided walk with a traditional Goan lunch.",
  },
  {
    slug: "custom-trip-vs-package",
    title: "Custom Trip or Fixed Package: Which Is Right for You?",
    category: "Travel Tips",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80",
    excerpt: "A practical breakdown of when a tailor-made itinerary is worth it, and when a fixed package makes more sense.",
    date: "2026-03-22",
    relatedDestination: null,
    content:
      "Fixed departures work well when you're travelling solo or in a small group and want the camaraderie of joining other travellers, typically at a lower price point due to shared costs. Custom trips make sense when you have specific dates, a particular pace in mind, or want to combine destinations that don't fit a standard itinerary. As a rule of thumb: if flexibility matters more than budget, go custom; if budget and the social aspect of group travel matter more, a fixed departure is usually the better fit.",
  },
  {
    slug: "north-east-india-guide",
    title: "Why Northeast India Deserves a Spot on Your Travel List",
    category: "Destinations",
    image: "https://images.unsplash.com/photo-1544634076-a90160ddf22e?auto=format&fit=crop&w=1000&q=80",
    excerpt: "Sikkim and Arunachal Pradesh offer some of India's most rewarding, least crowded Himalayan experiences.",
    date: "2026-03-05",
    relatedDestination: "sikkim",
    content:
      "Northeast India remains one of the country's most underexplored regions, despite offering landscapes and culture on par with anywhere in the Himalayas. Sikkim's well-developed tourism infrastructure makes it an easy entry point, with Gangtok as a comfortable base for excursions to Tsomgo Lake and Nathula Pass. Arunachal Pradesh, further east, requires more planning — Inner Line Permits and longer road journeys — but rewards visitors with the remote Tawang Monastery and the untouched beauty of Ziro Valley.",
  },
];

export const getBlogBySlug = (slug) => blogs.find((b) => b.slug === slug);

export const howItWorksSteps = [
  { step: 1, title: "Share Your Travel Plan", desc: "Tell us your destination, dates and preferences through a quick form or call." },
  { step: 2, title: "Get a Customised Itinerary", desc: "Our travel experts design a detailed plan and transparent quote within 24 hours." },
  { step: 3, title: "Confirm and Start Your Journey", desc: "Approve, pay securely, and we handle everything else — right down to on-trip support." },
];

export const whyChooseUs = [
  { title: "Personalised Itineraries", desc: "Every trip tailored to your pace, budget and interests." },
  { title: "Transparent Pricing", desc: "No hidden costs — what you see is what you pay." },
  { title: "Verified Hotels & Transport", desc: "Every partner is vetted and regularly reviewed." },
  { title: "Experienced Travel Experts", desc: "Real destination specialists, not call-centre scripts." },
  { title: "24/7 Assistance", desc: "Support before, during and after your trip." },
  { title: "Secure Payments", desc: "Industry-standard encryption on every transaction." },
  { title: "Local Destination Support", desc: "On-ground contacts in every major destination we serve." },
  { title: "Flexible Trip Planning", desc: "Reschedule and customise with minimal hassle." },
];
