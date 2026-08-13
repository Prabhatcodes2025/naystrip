import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/shared/Seo";
import PackageCard from "../components/tours/PackageCard";
import { tours } from "../data/tours";
import usePublicPackages from "../hooks/usePublicPackages";

export default function ToursListing() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || params.get("destination") || "");
  const [days, setDays] = useState("All");
  const { bySlug } = usePublicPackages();
  const filtered = useMemo(() => tours.filter((tour) => (!query || `${tour.title} ${tour.destinations.join(" ")}`.toLowerCase().includes(query.toLowerCase())) && (days === "All" || String(tour.days) === days)), [query, days]);
  return <>
    <Seo title="Maharashtra Tour Packages | NaysTrip & Treks" description="Browse structured Maharashtra itineraries across Mumbai, Mahabaleshwar, Konkan, Nashik, Shirdi, Ajanta, Ellora and more."/>
    <section className="relative overflow-hidden bg-[#173c34] pb-16 pt-24 text-white"><div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-white/10"/><div className="container-lg relative"><p className="eyebrow !text-orange-300">Domestic · Maharashtra</p><h1 className="mt-4 max-w-4xl font-display text-5xl leading-tight sm:text-7xl">Routes with a reason for every stop.</h1><p className="mt-5 max-w-2xl leading-7 text-white/70">Every itinerary balances key attractions, local experiences and a comfortable travel pace. Approved prices appear when available; every other route is quoted after live availability is checked.</p></div></section>
    <section className="sticky top-[82px] z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur"><div className="container-lg flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><span className="sr-only">Search packages</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Mumbai, Konkan, Shirdi…" className="h-12 w-full rounded-full border border-slate-300 pl-11 pr-4 focus:border-orange-500 focus:outline-none"/></label><label className="relative"><SlidersHorizontal className="absolute left-4 top-3.5 text-slate-400" size={18}/><span className="sr-only">Filter by duration</span><select value={days} onChange={(event) => setDays(event.target.value)} className="h-12 min-w-52 appearance-none rounded-full border border-slate-300 bg-white pl-11 pr-8 focus:border-orange-500 focus:outline-none"><option>All</option>{[3,4,5,6].map((value) => <option key={value} value={value}>{value} days</option>)}</select></label></div></section>
    <section className="bg-[#fffdf8] py-16 sm:py-20"><div className="container-lg"><p className="mb-7 text-sm font-semibold text-slate-500">{filtered.length} supplied itineraries</p>{filtered.length ? <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((tour, index) => <PackageCard key={tour.slug} tour={tour} commercial={bySlug.get(tour.slug)} priority={index < 3}/>)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-display text-3xl text-[#173c34]">No matching route yet</h2><p className="mt-3 text-slate-600">Try a broader destination or ask us to build a custom trip.</p></div>}</div></section>
  </>;
}
