import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/shared/Seo";
import PackageCard from "../components/tours/PackageCard";
import { tours } from "../data/tours";
import usePublicPackages from "../hooks/usePublicPackages";
import { PageBanner } from "../components/shared/Bits";

export default function ToursListing() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || params.get("destination") || "");
  const [days, setDays] = useState("All");
  const { bySlug,packages } = usePublicPackages();
  const filtered = useMemo(() => {const merged=new Map(tours.map((tour)=>[tour.slug,tour]));for(const pkg of packages)merged.set(pkg.slug,pkg);const term=query.trim().toLowerCase();return [...merged.values()].filter((tour) => (!term || [tour.title,tour.destination,tour.package_type,tour.tripType,...(tour.destinations||tour.destination_names||[])].join(" ").toLowerCase().includes(term)) && (days === "All" || String(tour.days) === days))}, [query, days,packages]);
  return <>
    <Seo title="Maharashtra Tour Packages | NaysTrip & Treks" description="Browse structured Maharashtra itineraries across Mumbai, Mahabaleshwar, Konkan, Nashik, Shirdi, Ajanta, Ellora and more."/>
    <PageBanner eyebrow="Domestic · Maharashtra" title="Routes with a reason for every stop." subtitle="Thoughtfully paced itineraries with transparent availability and pricing." image={tours[0].image} />
    <section className="sticky top-[82px] z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur"><div className="container-lg flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><span className="sr-only">Search packages</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Mumbai, Konkan, Shirdi…" className="h-12 w-full rounded-full border border-slate-300 pl-11 pr-4 focus:border-orange-500 focus:outline-none"/></label><label className="relative"><SlidersHorizontal className="absolute left-4 top-3.5 text-slate-400" size={18}/><span className="sr-only">Filter by duration</span><select value={days} onChange={(event) => setDays(event.target.value)} className="h-12 min-w-52 appearance-none rounded-full border border-slate-300 bg-white pl-11 pr-8 focus:border-orange-500 focus:outline-none"><option>All</option>{[3,4,5,6].map((value) => <option key={value} value={value}>{value} days</option>)}</select></label></div></section>
    <section className="bg-[#fffdf8] py-16 sm:py-20"><div className="container-lg"><p className="mb-7 text-sm font-semibold text-slate-500">{filtered.length} published itineraries</p>{filtered.length ? <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((tour, index) => <PackageCard key={tour.slug} tour={tour.hero_image?{...tour,image:tour.hero_image,destinations:tour.destination_names||[],duration:`${tour.days} Days / ${tour.nights} Nights`,price:tour.price_from}:tour} commercial={bySlug.get(tour.slug)} priority={index < 3}/>)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-display text-3xl text-[#173c34]">No matching packages</h2><p className="mt-3 text-slate-600">Try a broader destination or clear the search and duration filter.</p></div>}</div></section>
  </>;
}
