import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import SmartImage from "../shared/SmartImage";

export default function PackageCard({ tour, commercial, priority = false }) {
  const online = Boolean(commercial?.booking_state?.online);
  const price = commercial?.price_from;
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(19,52,45,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(19,52,45,.14)]">
      <Link to={`/tours/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <SmartImage src={commercial?.hero_image || tour.image} context={`${tour.title} ${tour.destinations.join(" ")}`} alt={`${tour.title} tour`} className="object-cover transition duration-700 group-hover:scale-105" loading={priority ? "eager" : "lazy"} />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#173c34]">{tour.duration}</span>
      </Link>
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPin size={14} className="text-orange-600" />{tour.destinations.slice(0, 3).join(" · ")}</p>
        <h3 className="mt-3 font-display text-2xl leading-tight text-[#173c34]"><Link to={`/tours/${tour.slug}`}>{tour.title}</Link></h3>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div><span className="block text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{price != null ? "Starting from" : "Pricing"}</span><strong className="mt-1 block text-lg text-[#173c34]">{price != null ? `₹${Number(price).toLocaleString("en-IN")}` : "Price on request"}</strong></div>
          <Link to={online ? `/checkout/${tour.slug}` : `/tours/${tour.slug}`} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-orange-600">{online ? <CalendarDays size={14}/> : null}{online ? "Book now" : "View & enquire"}<ArrowRight size={14}/></Link>
        </div>
      </div>
    </article>
  );
}
