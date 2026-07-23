import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, MapPin, Clock, Users, Hotel, Car, MessageSquareText } from "lucide-react";
import { tours } from "../data/tours";
import { PageBanner, StarRating, PriceTag, EmptyState } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

const tripTypes = ["Adventure", "Honeymoon", "Family", "Luxury"];

export default function ToursListing() {
  const [params] = useSearchParams();
  const [type, setType] = useState("All");
  const [tripType, setTripType] = useState(params.get("tripType") || "All");
  const [budget, setBudget] = useState(100000);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState(params.get("destination") || "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = useMemo(() => {
    let list = tours.filter((t) => {
      if (type !== "All" && t.type !== type) return false;
      if (tripType !== "All" && t.tripType !== tripType) return false;
      if (t.price > budget) return false;
      if (search && !`${t.title} ${t.destination}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [type, tripType, budget, search, sort]);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-navy-900 mb-3">Trip Origin</h4>
        <div className="flex flex-wrap gap-2">
          {["All", "Domestic", "International"].map((o) => (
            <button
              key={o}
              onClick={() => setType(o)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                type === o ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-navy-900 mb-3">Trip Type</h4>
        <div className="flex flex-wrap gap-2">
          {["All", ...tripTypes].map((o) => (
            <button
              key={o}
              onClick={() => setTripType(o)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                tripType === o ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-navy-900 mb-3">Budget: up to ₹{budget.toLocaleString("en-IN")}</h4>
        <input
          type="range"
          min={5000}
          max={100000}
          step={1000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-terracotta-500"
        />
      </div>
      <button
        onClick={() => { setType("All"); setTripType("All"); setBudget(100000); setSearch(""); }}
        className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      <Seo title="All Tour Packages | Altiora Journeys" description="Browse domestic and international tour packages, filter by budget, trip type and destination." />
      <PageBanner
        eyebrow="Explore"
        title="All Tour Packages"
        subtitle="Curated itineraries across India and beyond, ready to book or customise."
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by destination or tour name..."
              className="input-field sm:max-w-md"
            />
            <div className="flex items-center gap-3 sm:ml-auto">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field !w-auto">
                <option value="popular">Sort: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-3 text-sm font-semibold text-navy-700"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="card-surface p-6 sticky top-28">{FilterPanel}</div>
            </aside>

            <div className="lg:col-span-3">
              <p className="text-sm text-navy-500 mb-5">{filtered.length} packages found</p>
              {filtered.length === 0 ? (
                <EmptyState title="No packages match your filters" subtitle="Try adjusting your budget or trip type." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filtered.slice(0, visibleCount).map((t) => (
                    <Reveal key={t.slug}>
                      <div className="card-surface overflow-hidden group h-full flex flex-col hover:shadow-lift hover:-translate-y-1">
                        <Link to={`/tours/${t.slug}`} className="relative block overflow-hidden aspect-[4/3]">
                          <img src={t.image} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          {t.originalPrice > t.price && (
                            <span className="absolute top-3 left-3 rounded-full bg-terracotta-500 px-3 py-1 text-xs font-bold text-white">
                              {Math.round(100 - (t.price / t.originalPrice) * 100)}% OFF
                            </span>
                          )}
                          <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-navy-800 flex items-center gap-1">
                            <MapPin size={11} /> {t.destination}
                          </span>
                        </Link>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <StarRating rating={t.rating} />
                            <span className="text-xs text-navy-400">{t.reviews} reviews</span>
                          </div>
                          <Link to={`/tours/${t.slug}`}>
                            <h3 className="font-display text-lg font-semibold text-navy-900 mt-2 hover:text-terracotta-600 transition-colors">{t.title}</h3>
                          </Link>
                          <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-navy-500">
                            <span className="flex items-center gap-1.5"><Clock size={13} /> {t.duration}</span>
                            <span className="flex items-center gap-1.5"><Users size={13} /> {t.groupSize}</span>
                            <span className="flex items-center gap-1.5"><Hotel size={13} /> {t.hotelCategory}</span>
                            <span className="flex items-center gap-1.5"><Car size={13} /> {t.transport}</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-navy-100"><PriceTag original={t.originalPrice} price={t.price} /></div>
                          <div className="mt-4 flex gap-2">
                            <Link to={`/tours/${t.slug}`} className="flex-1 rounded-full border-2 border-navy-800 py-2.5 text-center text-xs font-semibold text-navy-800 hover:bg-navy-800 hover:text-white transition-colors">
                              View Details
                            </Link>
                            <Link to={`/tours/${t.slug}#inquiry`} className="flex-1 rounded-full bg-terracotta-500 py-2.5 text-center text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors flex items-center justify-center gap-1.5">
                              <MessageSquareText size={13} /> Inquire
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
              {visibleCount < filtered.length && (
                <div className="mt-10 text-center">
                  <button onClick={() => setVisibleCount((v) => v + 6)} className="btn-secondary">Load More</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-navy-900">Filters</h3>
              <button onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            {FilterPanel}
            <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full mt-8">Apply Filters</button>
          </div>
        </div>
      )}
    </>
  );
}
