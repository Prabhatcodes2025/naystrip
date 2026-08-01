import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Instagram, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import { getSiteSettings } from "../../data/siteConfig";

const nav=[
  ["Tours","/tours"],["Destinations","/destinations"],["Treks","/treks"],["Expeditions","/expeditions"],["Custom trip","/custom-trip"],["Transport","/transport"],["Blog","/blog"],["Contact","/contact"],
];
export default function Header(){
 const [open,setOpen]=useState(false);const loc=useLocation();const s=getSiteSettings();
 useEffect(()=>setOpen(false),[loc.pathname]);useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow=""}},[open]);
 return <header className="sticky top-0 z-50 bg-white">
  <div className="hidden bg-[#173c34] text-white/75 lg:block"><div className="container-lg flex h-9 items-center justify-between text-[11px] font-semibold"><div className="flex gap-6"><a href={`tel:${s.phone.replace(/\s/g,"")}`} className="flex items-center gap-2 hover:text-white"><Phone size={13}/>{s.phone}</a><a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={13}/>{s.email}</a></div><div className="flex items-center gap-5"><a href={s.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="NaysTrek on Instagram"><Instagram size={14}/></a><a href={s.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="NaysTrip on YouTube"><Youtube size={14}/></a><Link to="/b2b/login">B2B partner</Link><Link to="/account/login">Customer login</Link></div></div></div>
  <div className="border-b border-slate-200"><div className="container-lg flex h-[74px] items-center justify-between gap-7">
   <Link to="/" aria-label="NaysTrip and Treks home" className="flex shrink-0 items-center gap-3"><span className="grid h-10 w-10 place-items-center bg-orange-500 font-display text-2xl text-white">N</span><span><strong className="block font-display text-[22px] font-normal leading-none text-[#173c34]">NaysTrip</strong><span className="text-[9px] font-extrabold uppercase tracking-[.23em] text-orange-600">& Treks</span></span></Link>
   <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">{nav.map(([label,to])=><NavLink key={to} to={to} className={({isActive})=>`px-3 py-2 text-[13px] font-bold ${isActive?"text-orange-600":"text-slate-700 hover:text-orange-600"}`}>{label}</NavLink>)}<button aria-label="More services" className="flex items-center gap-1 px-3 py-2 text-[13px] font-bold text-slate-700">More <ChevronDown size={14}/></button></nav>
   <div className="flex items-center gap-3"><Link to="/custom-trip" className="hidden bg-orange-500 px-5 py-3 text-xs font-extrabold text-white hover:bg-orange-600 sm:inline-flex">Get a free quote</Link><button onClick={()=>setOpen(true)} className="grid h-11 w-11 place-items-center border border-slate-300 xl:hidden" aria-label="Open menu"><Menu/></button></div>
  </div></div>
  {open&&<div className="fixed inset-0 z-50 bg-[#102f29] text-white xl:hidden"><div className="flex h-[74px] items-center justify-between border-b border-white/15 px-5"><span className="font-display text-2xl">NaysTrip & Treks</span><button onClick={()=>setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center border border-white/25"><X/></button></div><nav className="grid gap-px p-5">{nav.map(([label,to])=><Link key={to} to={to} className="border-b border-white/10 py-4 font-display text-2xl">{label}</Link>)}<Link to="/corporate-travel" className="border-b border-white/10 py-4 font-display text-2xl">Corporate travel</Link><Link to="/b2b/login" className="border-b border-white/10 py-4 font-display text-2xl">B2B partner</Link></nav><div className="absolute inset-x-5 bottom-7 grid grid-cols-2 gap-3"><a href={`tel:${s.phone.replace(/\s/g,"")}`} className="border border-white/25 p-3 text-center text-sm font-bold">Call us</a><Link to="/custom-trip" className="bg-orange-500 p-3 text-center text-sm font-bold">Plan a trip</Link></div></div>}
 </header>;
}
