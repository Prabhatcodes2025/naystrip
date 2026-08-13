import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { destinations } from "../data/destinations";
import { PageBanner } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import SmartImage from "../components/shared/SmartImage";

export default function DestinationsListing() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  const regions = ["All", ...Array.from(new Set(destinations.map((d) => d.region)))];

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (region !== "All" && d.region !== region) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, region]);

  return (
    <>
      <Seo title="All Destinations | NaysTrip & Treks" description="Explore destinations across India and abroad with NaysTrip & Treks." />
      <PageBanner
        eyebrow="Explore"
        title="All Destinations"
        subtitle="From Himalayan passes to sun-drenched coasts — find your next journey."
        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative sm:max-w-md w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                    region === r ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d, i) => (
              <Reveal key={d.slug} delay={(i % 3) * 0.07}>
                <Link to={`/destinations/${d.slug}`} className="group block card-surface overflow-hidden hover:shadow-lift hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage src={d.image} context={d.name} alt={`${d.name} — ${d.tagline}`} loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-navy-800">
                      {d.region}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-navy-900">{d.name}</h3>
                    <p className="text-sm text-navy-500 mt-1">{d.tagline}</p>
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-navy-100">
                      <div>
                        <p className="text-[11px] text-navy-400">Starting from</p>
                        <p className="font-bold text-navy-900">₹{d.startingPrice.toLocaleString("en-IN")}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold text-terracotta-600 group-hover:gap-2 transition-all">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
