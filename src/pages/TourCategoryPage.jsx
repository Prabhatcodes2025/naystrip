import { ArrowRight, Globe2, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/shared/Seo";
import SmartImage from "../components/shared/SmartImage";
import { PageBanner } from "../components/shared/Bits";
import PackageCard from "../components/tours/PackageCard";
import { destinations } from "../data/destinations";
import { tours } from "../data/tours";
import { treks } from "../data/treksExpeditions";
import usePublicPackages from "../hooks/usePublicPackages";
import { imageFallbackFor } from "../data/imageFallbacks";

const internationalExperiences = treks.filter((item) => item.country !== "India");

export default function TourCategoryPage({ kind }) {
  const domestic = kind === "domestic";
  const { bySlug } = usePublicPackages();
  const hero = domestic ? tours[5].image : internationalExperiences[0]?.image;
  return <>
    <Seo title={`${domestic ? "Domestic" : "International"} Tours | NaysTrip & Treks`} description={domestic ? "Explore real NaysTrip itineraries across Maharashtra and India." : "Explore supported international journeys and request a tailored overseas trip."}/>
    <PageBanner eyebrow="Tours" title={`${domestic ? "Domestic" : "International"} journeys, planned clearly.`} subtitle={domestic ? "Browse available itineraries, compare duration and request the right stay and transport combination." : "Start with destinations we genuinely support. Where live inventory is limited, our team builds and quotes the route for you."} image={hero}/>
    {domestic ? <>
      <section className="py-14 sm:py-20"><div className="container-lg"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Popular domestic destinations</p><h2 className="section-title mt-3">Find your next landscape.</h2></div><Link to="/destinations" className="hidden items-center gap-2 text-sm font-bold text-[#173c34] sm:inline-flex">All destinations <ArrowRight size={16}/></Link></div><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{destinations.slice(0,8).map((item)=><Link key={item.slug} to={`/destinations/${item.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl"><SmartImage src={imageFallbackFor(item.name)} context={item.name} alt={item.name} wrapperClassName="absolute inset-0" className="object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 text-white"><h3 className="font-display text-xl sm:text-2xl">{item.name}</h3><p className="mt-1 text-xs text-white/70">Explore destination</p></div></Link>)}</div></div></section>
      <section className="bg-white py-14 sm:py-20"><div className="container-lg"><p className="eyebrow">Available packages</p><div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><h2 className="section-title">Ready itineraries, flexible details.</h2><span className="inline-flex items-center gap-2 text-sm text-slate-500"><Search size={16}/>{tours.length} supplied itineraries</span></div><div className="mt-9 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{tours.map((tour,index)=><PackageCard key={tour.slug} tour={tour} commercial={bySlug.get(tour.slug)} priority={index<3}/>)}</div></div></section>
    </> : <section className="py-14 sm:py-20"><div className="container-lg"><p className="eyebrow">Supported international travel</p><h2 className="section-title mt-3">Explore without invented inventory.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">These are international experiences already represented in NaysTrip's catalogue. For other countries, use the planner and we will confirm feasibility, price and documentation before presenting an option.</p><div className="mt-9 grid gap-6 md:grid-cols-2">{internationalExperiences.map((item)=><article key={item.slug} className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-[.9fr_1.1fr]"><SmartImage src={item.image} context={`${item.name} ${item.country}`} alt={item.name} className="object-cover" wrapperClassName="min-h-64"/><div className="p-6 sm:p-8"><Globe2 className="text-orange-600"/><p className="mt-5 text-xs font-bold uppercase tracking-[.15em] text-slate-400">{item.country} · {item.duration}</p><h3 className="mt-2 font-display text-3xl text-[#173c34]">{item.name}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.overview}</p><Link to={`/treks/${item.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600">Explore experience <ArrowRight size={15}/></Link></div></article>)}</div>{!internationalExperiences.length&&<div className="mt-9 rounded-2xl border border-slate-200 bg-white p-8"><MapPin className="text-orange-600"/><h3 className="mt-4 font-display text-3xl text-[#173c34]">Tell us where you want to go.</h3><p className="mt-2 text-slate-600">We will check real availability before quoting.</p></div>}</div></section>}
    <section className="bg-[#173c34] py-14 text-white sm:py-20"><div className="container-lg flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="eyebrow !text-orange-300">Custom trip</p><h2 className="mt-3 max-w-3xl font-display text-3xl sm:text-5xl">Dates, pace and stays built around your group.</h2></div><Link to="/custom-trip" className="btn-primary shrink-0">Plan my trip <ArrowRight size={16}/></Link></div></section>
  </>;
}
