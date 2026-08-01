import { ArrowRight, Compass, MapPin, Mountain, ShieldCheck, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/shared/Seo";
import { tours } from "../data/tours";

const services = [
  [Compass, "Tailor-made trips", "Dates, pace, stays and services arranged around you."],
  [MapPin, "Maharashtra expertise", "City breaks, pilgrimage circuits, hills and the Konkan coast."],
  [Mountain, "Treks & expeditions", "Adventure planning with fitness, safety and gear guidance."],
  [Users, "Groups & MICE", "Corporate offsites, educational travel and group logistics."],
];

export default function Home() {
  return <>
    <Seo title="NaysTrip & Treks | Tours, Treks, Expeditions & Custom Holidays" description="Plan domestic and international holidays, Maharashtra tours, treks, expeditions, corporate travel and tailor-made journeys with NaysTrip & Treks." />
    <section className="relative min-h-[720px] overflow-hidden bg-[#173c34] text-white">
      <img src="https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=2200&q=88" alt="Mumbai waterfront at dusk" className="absolute inset-0 h-full w-full object-cover opacity-55" fetchPriority="high" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,29,.96)_0%,rgba(10,35,29,.74)_48%,rgba(10,35,29,.25)_100%)]" />
      <div className="container-lg relative flex min-h-[720px] items-end pb-16 pt-28 sm:items-center sm:pb-0">
        <div className="max-w-3xl">
          <p className="eyebrow !text-orange-300">Mumbai based · India and beyond</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] sm:text-7xl lg:text-[88px]">Leisure to<br/><em className="font-normal text-orange-300">adventure.</em></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Expert-led journeys for families, groups and curious travellers—from a weekend in the Sahyadris to a fully custom international holiday.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/custom-trip" className="btn-primary">Plan my trip <ArrowRight size={17}/></Link>
            <Link to="/tours" className="inline-flex items-center justify-center gap-2 border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white hover:text-[#173c34]">Explore Maharashtra</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-5 text-xs font-semibold text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-orange-300"/> Clear inclusion and cancellation terms</span>
            <span className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-orange-300"/> Customisable before booking</span>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#fffaf2] py-20 sm:py-28">
      <div className="container-lg grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
        <div><p className="eyebrow">How we travel</p><h2 className="section-title mt-4">Built around the way you want to go.</h2></div>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">NaysTrip & Treks plans leisure, educational, cultural and adventure travel for individuals, students, families, larger groups and corporates—with one team coordinating the route from first conversation to return.</p>
      </div>
      <div className="container-lg mt-14 grid gap-px overflow-hidden border border-[#dcd6c9] bg-[#dcd6c9] sm:grid-cols-2 lg:grid-cols-4">
        {services.map(([Icon,title,copy],i)=><article key={title} className="group bg-[#fffaf2] p-7 lg:p-9"><span className="text-xs font-bold text-orange-600">0{i+1}</span><Icon className="mt-12 text-[#173c34]"/><h3 className="mt-5 font-display text-2xl text-[#173c34]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p></article>)}
      </div>
    </section>

    <section className="py-20 sm:py-28">
      <div className="container-lg flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">From the supplied itineraries</p><h2 className="section-title mt-4">Maharashtra, thoughtfully routed.</h2></div>
        <Link to="/tours" className="inline-flex items-center gap-2 font-bold text-[#173c34]">View all {tours.length} packages <ArrowRight size={17}/></Link>
      </div>
      <div className="container-lg mt-10 grid gap-6 lg:grid-cols-3">
        {tours.slice(4,7).map((tour,i)=><Link key={tour.slug} to={`/tours/${tour.slug}`} className={`group relative overflow-hidden ${i===0?'lg:row-span-2 lg:min-h-[640px]':'min-h-[307px]'}`}>
          <img src={tour.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"/>
          <div className="absolute inset-x-0 bottom-0 p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-300">{tour.duration}</p><h3 className="mt-2 font-display text-3xl">{tour.title}</h3><p className="mt-3 text-sm text-white/70">Price on request · Customisable</p></div>
        </Link>)}
      </div>
    </section>

    <section className="bg-[#173c34] py-20 text-white sm:py-24">
      <div className="container-lg grid gap-12 lg:grid-cols-2 lg:items-center">
        <div><Sparkles className="text-orange-300"/><h2 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-6xl">Not finding your route? That is where the planning starts.</h2></div>
        <div><p className="max-w-lg text-lg leading-8 text-white/70">Tell us where you are leaving from, the people travelling, your dates and the services you need. We will shape a practical route and quote for you.</p><Link to="/custom-trip" className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-6 py-4 text-sm font-extrabold text-white hover:bg-orange-600">Start the custom planner <ArrowRight size={17}/></Link></div>
      </div>
    </section>
  </>;
}
