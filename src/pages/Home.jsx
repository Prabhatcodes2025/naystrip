import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Car, Check, ChevronDown, Compass, Headphones, MapPin, Mountain, Plane, Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/shared/Seo";
import PackageCard from "../components/tours/PackageCard";
import SmartImage from "../components/shared/SmartImage";
import { blogs, testimonials } from "../data/content";
import { destinations } from "../data/destinations";
import { tours } from "../data/tours";
import usePublicPackages from "../hooks/usePublicPackages";

const heroSlides = [
  { tour: tours[0], kicker: "Mumbai & Maharashtra", title: "Stories begin where the usual route ends.", copy: "Thoughtfully paced city, coast, heritage and hill journeys, planned by a team based in Navi Mumbai.", position: "center 48%" },
  { tour: tours[7], kicker: "Konkan Coast", title: "Follow the coast at your own rhythm.", copy: "Build a route around beaches, food, forts and stays that suit the people travelling with you.", position: "center 58%" },
  { tour: tours[5], kicker: "Western Ghats", title: "Trade the checklist for a better journey.", copy: "Flexible itineraries, transparent inclusions and practical on-trip support from first call to return.", position: "center 42%" },
  { tour: tours[1], kicker: "Heritage circuits", title: "Go deeper than a weekend away.", copy: "Connect Maharashtra’s remarkable caves, temples and historic cities without rushing between them.", position: "center 50%" },
];

const services = [
  [Plane, "Flights & holidays", "Domestic and international trip planning with flights, stays and transfers coordinated together.", "/holidays"],
  [Mountain, "Treks & expeditions", "Adventure routes with fitness, safety, equipment and on-ground guidance.", "/treks"],
  [Car, "Transport", "Point-to-point and multi-day vehicle planning for families, groups and corporate teams.", "/transport"],
  [Building2, "Corporate & MICE", "Offsites, educational travel, conferences and group logistics managed end to end.", "/corporate-travel"],
];

const faqs = [
  ["Can I customise a published package?", "Yes. Dates, pace, stay category, pickup point and optional services can be adjusted before you approve the final quotation."],
  ["Why do some packages say Price on request?", "It means an online price has not been approved for that route. We first confirm dates, occupancy and live supplier availability, then send a written quote."],
  ["When is online booking available?", "Only when the package is published, has approved pricing and meets its availability rules. The Book now button appears automatically when those checks pass."],
  ["How are cancellations handled?", "The applicable schedule and any disclosed supplier-specific terms are shown before confirmation. You can also review our public Cancellation and Refund policies."],
];

export default function Home() {
  const navigate = useNavigate();
  const { bySlug } = usePublicPackages();
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("tours");
  const [departures, setDepartures] = useState([]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    fetch("/api/departures").then((response) => response.ok ? response.json() : { departures: [] }).then((data) => setDepartures((data.departures || []).filter((item) => item.status !== "sold_out").slice(0, 3))).catch(() => setDepartures([]));
  }, []);
  const featured = useMemo(() => [...tours].sort((a, b) => Number(Boolean(bySlug.get(b.slug)?.featured)) - Number(Boolean(bySlug.get(a.slug)?.featured))).slice(0, 6), [bySlug]);
  const submitSearch = (event) => { event.preventDefault(); navigate(`/${kind}?q=${encodeURIComponent(query.trim())}`); };
  const active = heroSlides[slide];
  return <>
    <Seo title="NaysTrip & Treks | Tailor-made Tours, Treks & Holidays" description="Plan Maharashtra tours, treks, expeditions, corporate travel and tailor-made holidays with a Navi Mumbai-based travel team." />
    <section className="home-hero relative overflow-hidden bg-[#102f29] text-white">
      {heroSlides.map((item, index) => <SmartImage key={item.tour.slug} src={item.tour.image} context={item.kicker} alt={index === slide ? `${item.kicker} travel experience` : ""} wrapperClassName={`absolute inset-0 transition duration-1000 ${index === slide ? "scale-100 opacity-70" : "scale-105 opacity-0"}`} className="object-cover" style={{ objectPosition: item.position }} fetchPriority={index === 0 ? "high" : "auto"} loading={index === 0 ? "eager" : "lazy"}/>) }
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,26,.96)_0%,rgba(8,31,26,.76)_50%,rgba(8,31,26,.22)_100%)]" />
      <div className="home-hero__content container-lg relative flex items-center">
        <div className="max-w-4xl">
          <p className="eyebrow !text-orange-300">{active.kicker} · Leisure to Adventure</p>
          <h1 className="home-hero__title mt-4 max-w-4xl font-display">{active.title}</h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">{active.copy}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to={`/tours/${active.tour.slug}`} className="btn-primary">Explore this journey <ArrowRight size={17}/></Link><Link to="/custom-trip" className="inline-flex items-center justify-center gap-2 border border-white/40 px-6 py-3.5 text-sm font-bold hover:bg-white hover:text-[#173c34]">Plan a custom trip</Link></div>
          <div className="mt-10 flex items-center gap-3"><button onClick={() => setSlide((slide - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous hero slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10"><ArrowLeft size={18}/></button><span className="text-xs font-bold tracking-[.2em]">0{slide + 1} / 0{heroSlides.length}</span><button onClick={() => setSlide((slide + 1) % heroSlides.length)} aria-label="Next hero slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10"><ArrowRight size={18}/></button></div>
        </div>
      </div>
      <form onSubmit={submitSearch} className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-[#102f29]/92 backdrop-blur"><div className="container-lg grid gap-px bg-white/15 sm:grid-cols-[1fr_220px_auto]"><label className="flex items-center gap-3 bg-[#102f29] px-5 py-4"><Search size={19} className="text-orange-300"/><span className="sr-only">Search destination</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Where would you like to go?" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"/></label><label className="relative flex items-center bg-[#102f29] px-5"><Compass size={18} className="mr-3 text-orange-300"/><span className="sr-only">Travel type</span><select value={kind} onChange={(event) => setKind(event.target.value)} className="h-14 w-full appearance-none bg-transparent text-sm font-bold text-white outline-none"><option className="text-slate-900" value="tours">Tour packages</option><option className="text-slate-900" value="treks">Treks</option><option className="text-slate-900" value="expeditions">Expeditions</option></select><ChevronDown size={16}/></label><button className="bg-orange-500 px-8 py-4 text-sm font-extrabold hover:bg-orange-600">Find a journey</button></div></form>
    </section>

    <section className="border-b border-slate-200 bg-[#fffaf2]"><div className="container-lg grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">{[[ShieldCheck,"Clear terms","Pricing and policies before payment"],[SlidersHorizontal,"Built around you","Customisable before booking"],[Headphones,"Human support","Real help throughout your trip"],[MapPin,"Local planning","Navi Mumbai-based travel team"]].map(([Icon,title,copy])=><div key={title} className="p-5 sm:p-7"><Icon size={20} className="text-orange-600"/><strong className="mt-3 block text-sm text-[#173c34]">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{copy}</span></div>)}</div></section>

    <section className="py-20 sm:py-28"><div className="container-lg flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Curated routes</p><h2 className="section-title mt-4">Maharashtra, thoughtfully connected.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">Choose a proven itinerary, then shape the details around your dates and travelling party.</p></div><Link to="/tours" className="inline-flex items-center gap-2 font-bold text-[#173c34]">View all packages <ArrowRight size={17}/></Link></div><div className="container-lg mt-11 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{featured.map((tour, index) => <PackageCard key={tour.slug} tour={tour} commercial={bySlug.get(tour.slug)} priority={index < 3}/>)}</div></section>

    <section className="overflow-hidden bg-[#173c34] py-16 text-white sm:py-24"><div className="container-lg"><div className="max-w-3xl"><p className="eyebrow !text-orange-300">Choose your landscape</p><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Places worth slowing down for.</h2></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{destinations.slice(0, 4).map((destination) => <Link key={destination.slug} to={`/destinations/${destination.slug}`} className="group relative h-[360px] overflow-hidden rounded-2xl sm:h-[390px] lg:h-[380px]"><SmartImage src={destination.image} context={destination.name} alt={destination.name} wrapperClassName="absolute inset-0" className="object-cover transition duration-700 group-hover:scale-105" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-300">{destination.bestTime}</p><h3 className="mt-2 font-display text-3xl">{destination.name}</h3><p className="mt-2 text-sm text-white/70">{destination.tagline}</p></div></Link>)}</div></div></section>

    {departures.length > 0 && <section className="bg-[#fffaf2] py-20 sm:py-24"><div className="container-lg"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Live availability</p><h2 className="section-title mt-4">Upcoming group departures.</h2></div><Link to="/fixed-departures" className="font-bold text-[#173c34]">See all</Link></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{departures.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6"><CalendarDays className="text-orange-600"/><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-slate-400">{new Date(`${item.start_date}T00:00:00`).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p><h3 className="mt-2 font-display text-2xl text-[#173c34]">{item.package?.title}</h3><p className="mt-3 text-sm text-slate-500">{item.available_seats} seats available · {item.package?.days} days</p><Link to={`/tours/${item.package?.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600">View departure <ArrowRight size={15}/></Link></article>)}</div></div></section>}

    <section className="py-20 sm:py-28"><div className="container-lg grid gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><p className="eyebrow">Everything around the route</p><h2 className="section-title mt-4">One travel team, every moving part.</h2><p className="mt-5 leading-7 text-slate-600">From a single airport transfer to an entire company offsite, choose the support your journey actually needs.</p><Link to="/contact" className="btn-primary mt-8">Talk to a planner <ArrowRight size={16}/></Link></div><div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">{services.map(([Icon,title,copy,to]) => <Link to={to} key={title} className="group bg-white p-7 sm:p-9"><Icon className="text-orange-600"/><h3 className="mt-8 font-display text-2xl text-[#173c34]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#173c34]">Explore <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></Link>)}</div></div></section>

    <section className="bg-[#fff3df] py-20 sm:py-24"><div className="container-lg grid gap-10 lg:grid-cols-2 lg:items-center"><div><Sparkles className="text-orange-600"/><p className="eyebrow mt-5">Made for your people</p><h2 className="section-title mt-4">A trip should fit the travellers, not the template.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Share your dates, starting city, interests, pace and budget. We’ll turn it into a practical route and a clear written quote.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{["Dates and pace that work", "Stay category you choose", "Clear inclusions and exclusions", "Support before and during travel"].map((item) => <span key={item} className="flex items-center gap-2 text-sm font-semibold text-[#173c34]"><Check size={17} className="text-orange-600"/>{item}</span>)}</div></div><div className="rounded-[2rem] bg-[#173c34] p-8 text-white sm:p-12"><h3 className="font-display text-4xl">Start with the journey in your head.</h3><p className="mt-4 leading-7 text-white/70">No payment, no invented price—just enough information for our team to build the right option.</p><Link to="/custom-trip" className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-sm font-extrabold">Build my trip <ArrowRight size={16}/></Link></div></div></section>

    {testimonials.length > 0 && <section className="py-20"><div className="container-lg"><p className="eyebrow">Traveller stories</p><h2 className="section-title mt-4">Journeys told by the people who took them.</h2></div></section>}

    <section className="py-20 sm:py-24"><div className="container-lg grid gap-14 lg:grid-cols-2"><div><p className="eyebrow">Travel notes</p><h2 className="section-title mt-4">Useful before you set out.</h2><div className="mt-8 space-y-6">{blogs.slice(0, 3).map((blog) => <Link key={blog.slug} to={`/blog/${blog.slug}`} className="group grid grid-cols-[110px_1fr] gap-5 border-b border-slate-200 pb-6"><img src={blog.image} alt="" className="h-24 w-full rounded-xl object-cover" loading="lazy"/><div><p className="text-xs font-bold uppercase tracking-[.12em] text-orange-600">{blog.category}</p><h3 className="mt-2 font-display text-xl leading-tight text-[#173c34] group-hover:text-orange-600">{blog.title}</h3></div></Link>)}</div></div><div><p className="eyebrow">Good to know</p><h2 className="section-title mt-4">Questions before you book.</h2><div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">{faqs.map(([question,answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#173c34]">{question}<ChevronDown size={18} className="transition group-open:rotate-180"/></summary><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{answer}</p></details>)}</div><div className="mt-6 flex gap-5 text-sm font-bold"><Link to="/faqs" className="text-orange-600">All FAQs</Link><Link to="/cancellation-policy" className="text-orange-600">Cancellation policy</Link></div></div></div></section>

    <section className="relative overflow-hidden bg-[#102f29] py-20 text-white sm:py-28"><img src={tours[11].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" loading="lazy"/><div className="container-lg relative text-center"><p className="eyebrow !text-orange-300">Ready when you are</p><h2 className="mx-auto mt-4 max-w-4xl font-display text-4xl sm:text-6xl">Your next story needs a starting point.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-white/70">Browse a ready itinerary or tell us what you want to build from scratch.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/tours" className="btn-primary">Explore packages <ArrowRight size={16}/></Link><Link to="/contact" className="inline-flex items-center justify-center border border-white/35 px-6 py-3.5 text-sm font-bold hover:bg-white hover:text-[#173c34]">Speak to NaysTrip</Link></div></div></section>
  </>;
}
