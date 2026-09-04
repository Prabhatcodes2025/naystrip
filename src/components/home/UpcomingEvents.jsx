import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import SmartImage from "../shared/SmartImage";

const isCurrentOrUpcoming=(event)=>{const boundary=event.endDate||event.startDate;if(!event.published||!boundary)return false;return new Date(`${boundary}T23:59:59`).getTime()>=Date.now()};
const eventHref=(event)=>event.ctaTarget||`/#event-${event.id}`;

export default function UpcomingEvents({events=[]}){
 const active=useMemo(()=>events.filter(isCurrentOrUpcoming).sort((a,b)=>Number(a.displayOrder||0)-Number(b.displayOrder||0)||String(a.startDate).localeCompare(String(b.startDate))),[events]);
 const featured=active.find((event)=>event.featured);
 const [alertOpen,setAlertOpen]=useState(false);const closeRef=useRef(null);
 useEffect(()=>{if(!featured)return;const key=`naystrip_event_dismissed_${featured.id}`;if(!sessionStorage.getItem(key))setAlertOpen(true)},[featured]);
 useEffect(()=>{if(!alertOpen)return;closeRef.current?.focus();const key=(event)=>{if(event.key==="Escape")setAlertOpen(false)};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[alertOpen]);
 const close=()=>{if(featured)sessionStorage.setItem(`naystrip_event_dismissed_${featured.id}`,"1");setAlertOpen(false)};
 if(!active.length)return null;
 return <>
  <section id="upcoming-events" className="bg-white py-16 sm:py-20"><div className="container-lg"><p className="eyebrow">What’s coming up</p><h2 className="section-title mt-3">Upcoming Events</h2><div className="mt-8 grid gap-6 lg:grid-cols-3">{active.map((event)=><article id={`event-${event.id}`} key={event.id} className={`overflow-hidden rounded-2xl border bg-[#fffdf8] ${event.featured?"border-orange-300 shadow-md":"border-slate-200"}`}>{event.image&&<SmartImage src={event.image} context={event.title} alt={event.title} wrapperClassName="aspect-[16/9]" className="object-cover"/>}<div className="p-6"><div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wide text-orange-700"><span className="flex items-center gap-1"><CalendarDays size={14}/>{new Date(`${event.startDate}T00:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{event.startTime?` · ${event.startTime}`:""}</span>{event.location&&<span className="flex items-center gap-1"><MapPin size={14}/>{event.location}</span>}</div><h3 className="mt-3 font-display text-2xl text-[#173c34]">{event.title}</h3>{event.shortDescription&&<p className="mt-3 text-sm leading-6 text-slate-600">{event.shortDescription}</p>}<Link to={eventHref(event)} className="btn-secondary mt-5">{event.ctaLabel||"View event"}</Link></div></article>)}</div></div></section>
  {alertOpen&&featured&&<div role="dialog" aria-modal="false" aria-labelledby="featured-event-title" className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl animate-[fadeIn_.25s_ease-out] rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl sm:p-5"><div className="flex items-start gap-4">{featured.image&&<SmartImage src={featured.image} context={featured.title} alt="" wrapperClassName="hidden h-24 w-36 shrink-0 overflow-hidden rounded-xl sm:block" className="object-cover"/>}<Link to={eventHref(featured)} onClick={close} className="min-w-0 flex-1"><p className="text-xs font-extrabold uppercase tracking-wider text-orange-700">Featured upcoming event</p><h2 id="featured-event-title" className="mt-1 font-display text-2xl text-[#173c34]">{featured.title}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-600">{featured.shortDescription}</p><span className="mt-2 inline-block text-sm font-bold text-orange-700">{featured.ctaLabel||"View event"} →</span></Link><button ref={closeRef} onClick={close} aria-label="Dismiss event alert" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200"><X size={18}/></button></div></div>}
 </>;
}
