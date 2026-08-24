import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Instagram, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import { getSiteSettings, loadSiteSettings } from "../../data/siteConfig";
import BrandLogo from "../branding/BrandLogo";

const nav = [["Destinations", "/destinations"], ["Custom trip", "/custom-trip"], ["Transport / Services", "/transport"], ["Blog", "/blog"], ["Contact", "/contact"]];
const dropdownLink = "block min-h-11 px-4 py-3 text-sm font-bold hover:bg-orange-50 hover:text-orange-600";

function DesktopMenu({ name, label, active, setActive, align = "left", children }) {
  const open = active === name;
  return <div className="relative">
    <button type="button" aria-expanded={open} onClick={() => setActive(open ? "" : name)} className="flex min-h-11 items-center gap-1 px-3 py-3 text-[13px] font-bold text-slate-700 hover:text-orange-600">
      {label}<ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full w-60 border border-slate-200 bg-white p-2 shadow-xl`}>{children}</div>}
  </div>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState("");
  const desktopNav = useRef(null);
  const loc = useLocation();
  const [s,setSettings]=useState(getSiteSettings());
  const closeDropdown = () => setDropdown("");

  useEffect(() => { setOpen(false); setDropdown(""); }, [loc.pathname]);
  useEffect(()=>{loadSiteSettings().then(setSettings).catch(()=>{})},[]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => {
    const outside = (event) => { if (!desktopNav.current?.contains(event.target)) closeDropdown(); };
    const key = (event) => { if (event.key === "Escape") closeDropdown(); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); };
  }, []);

  const desktopLink = ([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `min-h-11 px-3 py-3 text-[13px] font-bold ${isActive ? "text-orange-600" : "text-slate-700 hover:text-orange-600"}`}>{label}</NavLink>;
  return <header className="sticky top-0 z-50 bg-white">
    <div className="bg-orange-50 text-[#173c34]"><div className="container-lg flex min-h-7 items-center justify-center px-3 py-1 text-center text-[11px] font-semibold sm:justify-end"><Link to="/b2b/register" className="hover:text-orange-700">Are you a Travel Agent? <strong>Become a B2B Partner →</strong></Link></div></div>
    <div className="hidden bg-[#173c34] text-white/75 lg:block"><div className="container-lg flex h-9 items-center justify-between text-[11px] font-semibold"><div className="flex gap-6"><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white"><Phone size={13} />{s.phone}</a><a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={13} />{s.email}</a></div><div className="flex items-center gap-5">{s.social?.instagram&&<a href={s.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="NaysTrek on Instagram"><Instagram size={14} /></a>}{s.social?.youtube&&<a href={s.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="NaysTrip on YouTube"><Youtube size={14} /></a>}<Link to="/b2b/login">B2B partner</Link><Link to="/account/login">Customer login</Link></div></div></div>
    <div className="border-b border-slate-200"><div className="container-lg flex h-[82px] items-center justify-between gap-7 lg:h-[96px]">
      <Link to="/" aria-label="NaysTrip home" className="flex shrink-0 items-center"><BrandLogo eager animated className="h-[72px] w-auto lg:h-[88px]" /></Link>
      <nav ref={desktopNav} aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
        <DesktopMenu name="tours" label="Tours" active={dropdown} setActive={setDropdown}><Link onClick={closeDropdown} to="/tours/domestic" className={dropdownLink}>Domestic Tours</Link><Link onClick={closeDropdown} to="/destinations/maharashtra" className={dropdownLink}>Maharashtra</Link><Link onClick={closeDropdown} to="/destinations/goa" className={dropdownLink}>Goa</Link><Link onClick={closeDropdown} to="/destinations/leh-ladakh" className={dropdownLink}>Leh Ladakh</Link><Link onClick={closeDropdown} to="/destinations/uttarakhand" className={dropdownLink}>Uttarakhand</Link><Link onClick={closeDropdown} to="/tours/international" className={dropdownLink}>International enquiries</Link><Link onClick={closeDropdown} to="/tours" className={dropdownLink}>All Tour Packages</Link></DesktopMenu>
        {nav.slice(0, 1).map(desktopLink)}
        <DesktopMenu name="adventure" label="Treks & Expeditions" active={dropdown} setActive={setDropdown}><Link onClick={closeDropdown} to="/treks" className={dropdownLink}>Treks</Link><Link onClick={closeDropdown} to="/expeditions" className={dropdownLink}>Expeditions</Link></DesktopMenu>
        {nav.slice(1).map(desktopLink)}
        <DesktopMenu name="more" label="More" active={dropdown} setActive={setDropdown} align="right"><Link onClick={closeDropdown} to="/holidays" className={dropdownLink}>Holidays</Link><Link onClick={closeDropdown} to="/fixed-departures" className={dropdownLink}>Fixed departures</Link><Link onClick={closeDropdown} to="/corporate-travel" className={dropdownLink}>Corporate & MICE</Link><Link onClick={closeDropdown} to="/custom-trip?service=visa" className={dropdownLink}>Visa assistance</Link><Link onClick={closeDropdown} to="/custom-trip?service=insurance" className={dropdownLink}>Travel insurance</Link><Link onClick={closeDropdown} to="/how-it-works" className={dropdownLink}>How it works</Link></DesktopMenu>
      </nav>
      <div className="flex items-center gap-3"><Link to="/custom-trip" className="hidden bg-orange-500 px-5 py-3 text-xs font-extrabold text-white hover:bg-orange-600 sm:inline-flex">Get a free quote</Link><button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center border border-slate-300 xl:hidden" aria-label="Open menu"><Menu /></button></div>
    </div></div>
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102f29] pb-28 text-white xl:hidden"><div className="flex h-[86px] items-center justify-between border-b border-white/15 px-5"><Link to="/" aria-label="NaysTrip home"><BrandLogo className="h-[70px] w-auto" /></Link><button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center border border-white/25"><X /></button></div><nav className="grid gap-px p-5"><details open className="border-b border-white/10"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-display text-2xl">Tours <ChevronDown size={19} /></summary><div className="grid pb-3 pl-3 text-base text-white/75"><Link to="/tours/domestic" className="min-h-11 py-3">Domestic Tours</Link><Link to="/tours/international" className="min-h-11 py-3">International Tours</Link><Link to="/tours" className="min-h-11 py-3">All Packages</Link></div></details><Link to="/destinations" className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl">Destinations</Link><details className="border-b border-white/10"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-display text-2xl">Treks & Expeditions <ChevronDown size={19} /></summary><div className="grid pb-3 pl-3 text-base text-white/75"><Link to="/treks" className="min-h-11 py-3">Treks</Link><Link to="/expeditions" className="min-h-11 py-3">Expeditions</Link></div></details>{nav.slice(1).map(([label, to]) => <Link key={to} to={to} className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl">{label}</Link>)}<Link to="/fixed-departures" className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl">Fixed departures</Link><Link to="/corporate-travel" className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl">Corporate travel</Link><Link to="/b2b/login" className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl">B2B partner</Link></nav><div className="fixed inset-x-5 bottom-7 grid grid-cols-2 gap-3"><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="grid min-h-11 place-items-center border border-white/25 bg-[#102f29] p-3 text-center text-sm font-bold">Call us</a><Link to="/custom-trip" className="grid min-h-11 place-items-center bg-orange-500 p-3 text-center text-sm font-bold">Plan a trip</Link></div></div>}
  </header>;
}
