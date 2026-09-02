import { useEffect, useState } from "react";
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { getSiteSettings, loadSiteSettings } from "../../data/siteConfig";
import BrandLogo from "../branding/BrandLogo";

const columns={
 Company:[["About us","/about"],["Corporate travel","/corporate-travel"],["Careers","/careers"],["Contact us","/contact"]],
 Explore:[["Domestic tours","/tours"],["Maharashtra packages","/tours"],["Destinations","/destinations"],["Treks","/treks"],["Expeditions","/expeditions"],["Blog","/blog"]],
 "Travel Services":[["International holidays","/holidays"],["Custom Holiday","/custom-trip"],["Group & Family Trip","/custom-trip?tripType=Friends%20group"],["School & college tours","/custom-trip?tripType=School%20or%20college"],["Transportation","/transport"],["Visa Assistance","/custom-trip?service=visa"],["Insurance Assistance","/custom-trip?service=insurance"],["Hotel assistance","/custom-trip?service=hotels"]],
 Support:[["FAQs","/faqs"],["Consent","/consent"],["Terms & conditions","/terms-and-conditions"],["User agreement","/user-agreement"],["Privacy policy","/privacy-policy"],["Cancellation policy","/cancellation-policy"],["Refund policy","/refund-policy"],["Payment policy","/payment-policy"],["Sitemap","/sitemap"]],
 Portal:[["Customer Login","/account/login"],["B2B Partner","/b2b/login"]],
};

export default function Footer(){
 const [s,setSettings]=useState(getSiteSettings());
 useEffect(()=>{loadSiteSettings().then(setSettings).catch(()=>{})},[]);
 const socials=[["instagram",Instagram,"Instagram"],["youtube",Youtube,"YouTube"],["facebook",Facebook,"Facebook"],["telegram",Send,"Telegram"]];
 return <footer className="bg-[#245448] text-white/80"><div className="container-lg py-16 sm:py-20"><div className="grid gap-10 xl:grid-cols-[1.25fr_repeat(5,minmax(0,1fr))]"><div><Link to="/" aria-label="NaysTrip home" className="inline-flex"><BrandLogo className="h-24 w-auto"/></Link><p className="mt-5 max-w-sm text-sm leading-7">{s.footerText}</p><div className="mt-6 flex gap-3">{socials.filter(([key])=>Boolean(s.social?.[key])).map(([key,Icon,label])=><a key={key} className="grid h-10 w-10 place-items-center border border-white/20 hover:text-orange-300" href={s.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon size={17}/></a>)}</div></div>{Object.entries(columns).map(([title,links])=><div key={title}><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-white">{title}</h2><ul className="mt-5 space-y-3 text-sm">{links.map(([label,to])=><li key={`${label}-${to}`}><Link to={to} className="hover:text-orange-300">{label}</Link></li>)}</ul></div>)}</div>
 <div className="mt-14 grid gap-6 border-t border-white/10 pt-8 text-sm md:grid-cols-3"><a href={`tel:${s.phone.replace(/\s/g,"")}`} className="flex gap-3"><Phone className="text-orange-400" size={18}/><span><small className="block text-white/40">Enquiries</small>{s.phone}</span></a><a href={`mailto:${s.email}`} className="flex gap-3"><Mail className="text-orange-400" size={18}/><span><small className="block text-white/40">Email</small>{s.email}</span></a><span className="flex gap-3"><MapPin className="shrink-0 text-orange-400" size={18}/><span><small className="block text-white/40">Office</small>{s.address}</span></span></div>
 <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row"><span>© {new Date().getFullYear()} NaysTrip & Treks. All rights reserved.</span><span>MI24 Securetech LLP · Navi Mumbai jurisdiction</span></div></div></footer>
}
