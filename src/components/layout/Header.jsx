import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Menu,
  X,
  ChevronDown,
  Compass,
} from "lucide-react";
import { getSiteSettings } from "../../data/siteConfig";
import { destinations } from "../../data/destinations";
import { holidayCategories } from "../../data/content";

const navLinkClass = ({ isActive }) =>
  `relative px-3.5 py-2 text-sm font-semibold transition-colors ${
    isActive ? "text-terracotta-500" : "text-navy-800 hover:text-terracotta-500"
  }`;

const destinationsPreview = destinations.slice(0, 8);

const dropdowns = {
  destinations: {
    label: "Destinations",
    items: destinationsPreview.map((d) => ({ label: d.name, to: `/destinations/${d.slug}` })),
    viewAll: { label: "View All Destinations", to: "/destinations" },
  },
  holidays: {
    label: "Holidays",
    items: holidayCategories.map((h) => ({ label: h.name, to: `/holidays?category=${h.slug}` })),
    viewAll: { label: "View All Holidays", to: "/holidays" },
  },
  fixedDepartures: {
    label: "Fixed Departures",
    items: [
      { label: "Upcoming Tours", to: "/fixed-departures?type=Tour" },
      { label: "Upcoming Treks", to: "/fixed-departures?type=Trek" },
      { label: "Upcoming Expeditions", to: "/fixed-departures?type=Expedition" },
      { label: "Volvo Packages", to: "/fixed-departures?type=Volvo Package" },
    ],
    viewAll: { label: "View All Departures", to: "/fixed-departures" },
  },
};

function DesktopDropdown({ config }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="relative flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-navy-800 hover:text-terracotta-500 transition-colors">
        {config.label}
        <ChevronDown size={15} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full pt-3 w-64 z-50"
          >
            <div className="rounded-2xl bg-white shadow-lift border border-navy-100 p-3">
              <div className="grid grid-cols-1 gap-0.5">
                {config.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-lg px-3 py-2.5 text-sm text-navy-700 hover:bg-cream hover:text-terracotta-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-navy-100 pt-2">
                <Link
                  to={config.viewAll.to}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-forest-700 hover:bg-forest-50 transition-colors"
                >
                  {config.viewAll.label} →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const location = useLocation();
  const settings = getSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="hidden lg:block bg-navy-950 text-white/85 text-xs">
        <div className="container-lg flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-gold-300 transition-colors">
              <Phone size={13} /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-gold-300 transition-colors">
              <Mail size={13} /> {settings.email}
            </a>
            <span className="flex items-center gap-1.5 text-white/60">
              <Clock size={13} /> Support available {settings.businessHours}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href={settings.social.instagram} aria-label="Instagram" className="hover:text-gold-300 transition-colors"><Instagram size={14} /></a>
              <a href={settings.social.facebook} aria-label="Facebook" className="hover:text-gold-300 transition-colors"><Facebook size={14} /></a>
              <a href={settings.social.youtube} aria-label="Youtube" className="hover:text-gold-300 transition-colors"><Youtube size={14} /></a>
            </div>
            <Link to="/contact" className="rounded-full bg-terracotta-500 px-4 py-1.5 font-semibold text-white hover:bg-terracotta-600 transition-colors">
              Get a Free Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className={`bg-white/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-soft" : ""}`}>
        <div className="container-lg flex items-center justify-between py-3.5">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
              <Compass size={20} />
            </span>
            <span className="font-display text-xl font-bold text-navy-900 leading-none">
              {settings.brandName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/tours" className={navLinkClass}>All Tours</NavLink>
            <DesktopDropdown id="destinations" config={dropdowns.destinations} />
            <DesktopDropdown id="holidays" config={dropdowns.holidays} />
            <DesktopDropdown id="fixedDepartures" config={dropdowns.fixedDepartures} />
            <NavLink to="/custom-trip" className={navLinkClass}>Custom Trip</NavLink>
            <NavLink to="/treks" className={navLinkClass}>Treks</NavLink>
            <NavLink to="/expeditions" className={navLinkClass}>Expeditions</NavLink>
            <NavLink to="/transport" className={navLinkClass}>Transport</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
            <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/custom-trip" className="hidden lg:inline-flex btn-primary !py-2.5 !px-5 !text-xs">
              Plan My Trip
            </Link>
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="xl:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-navy-200 text-navy-800"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-navy-950/60 xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 z-[70] h-full w-[86%] max-w-sm bg-white shadow-lift xl:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-navy-100 p-4">
                <span className="font-display text-lg font-bold text-navy-900">{settings.brandName}</span>
                <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-navy-700">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <Link to="/" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Home</Link>
                <Link to="/tours" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">All Tours</Link>

                {Object.entries(dropdowns).map(([key, config]) => (
                  <div key={key} className="border-b border-navy-50 pb-1">
                    <button
                      onClick={() => setMobileSection(mobileSection === key ? null : key)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream"
                    >
                      {config.label}
                      <ChevronDown size={16} className={`transition-transform ${mobileSection === key ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {mobileSection === key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-3"
                        >
                          {config.items.map((item) => (
                            <Link key={item.label} to={item.to} className="block rounded-lg px-3 py-2 text-sm text-navy-600 hover:bg-cream">
                              {item.label}
                            </Link>
                          ))}
                          <Link to={config.viewAll.to} className="block rounded-lg px-3 py-2 text-sm font-semibold text-forest-700 hover:bg-forest-50">
                            {config.viewAll.label} →
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <Link to="/custom-trip" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Custom Trip</Link>
                <Link to="/treks" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Treks</Link>
                <Link to="/expeditions" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Expeditions</Link>
                <Link to="/transport" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Transport</Link>
                <Link to="/corporate-travel" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Corporate Travel</Link>
                <Link to="/how-it-works" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">How It Works</Link>
                <Link to="/blog" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Blog</Link>
                <Link to="/contact" className="rounded-lg px-3 py-3 text-sm font-semibold text-navy-800 hover:bg-cream">Contact Us</Link>

                <Link to="/custom-trip" className="btn-primary mt-3 w-full">Plan My Trip</Link>
                <a href={`tel:${settings.phone}`} className="btn-secondary mt-2 w-full">
                  <Phone size={16} /> Call {settings.phone}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
