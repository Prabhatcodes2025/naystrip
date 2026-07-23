import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Compass, Search, ShieldCheck, Star, Headphones } from "lucide-react";

const trustStats = [
  { icon: Users, label: "10,000+ Happy Travellers" },
  { icon: Compass, label: "250+ Curated Trips" },
  { icon: Star, label: "4.9 Google Rating" },
  { icon: Headphones, label: "24/7 Travel Assistance" },
];

export default function Hero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [tripType, setTripType] = useState("");
  const [travellers, setTravellers] = useState("2 Travellers");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (tripType) params.set("tripType", tripType);
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-navy-950">
      <img
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"
        alt="Himalayan mountain range at golden hour, representing premium adventure travel"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/70 via-transparent to-navy-950/40" />

      <div className="container-lg relative z-10 pt-28 pb-16 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-xs font-semibold text-gold-200">
            <ShieldCheck size={14} /> Trusted by 10,000+ travellers since 2014
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] text-shadow-sm">
            Journeys Designed Around Your Dreams
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
            From peaceful mountain escapes to unforgettable international adventures, we create journeys that stay with you forever.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#packages" className="btn-primary">
              Explore Packages
            </a>
            <a href="/contact" className="btn-ghost-light">
              Get a Free Quote
            </a>
          </div>
        </motion.div>

        {/* Floating search panel */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 glass-panel p-3 sm:p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3.5 lg:col-span-1">
              <MapPin size={18} className="shrink-0 text-terracotta-500" />
              <div className="w-full">
                <span className="block text-[11px] font-semibold text-navy-400 uppercase tracking-wide">Destination</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to?"
                  className="w-full bg-transparent text-sm font-semibold text-navy-900 placeholder:text-navy-300 focus:outline-none"
                />
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3.5 lg:col-span-1">
              <Calendar size={18} className="shrink-0 text-terracotta-500" />
              <div className="w-full">
                <span className="block text-[11px] font-semibold text-navy-400 uppercase tracking-wide">Travel Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
                >
                  <option value="">Anytime</option>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3.5 lg:col-span-1">
              <Compass size={18} className="shrink-0 text-terracotta-500" />
              <div className="w-full">
                <span className="block text-[11px] font-semibold text-navy-400 uppercase tracking-wide">Trip Type</span>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
                >
                  <option value="">Any Type</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Family">Family</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3.5 lg:col-span-1">
              <Users size={18} className="shrink-0 text-terracotta-500" />
              <div className="w-full">
                <span className="block text-[11px] font-semibold text-navy-400 uppercase tracking-wide">Travellers</span>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
                >
                  <option>1 Traveller</option>
                  <option>2 Travellers</option>
                  <option>3-5 Travellers</option>
                  <option>6+ Travellers</option>
                </select>
              </div>
            </label>

            <button type="submit" className="btn-primary lg:col-span-1 !py-3.5">
              <Search size={17} /> Search
            </button>
          </div>
        </motion.form>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
        >
          {trustStats.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/85">
              <Icon size={17} className="text-gold-300" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
