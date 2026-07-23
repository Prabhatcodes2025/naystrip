import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Users, Hotel, Car, MessageSquareText } from "lucide-react";
import { destinations } from "../../data/destinations";
import { tours } from "../../data/tours";
import { SectionHeading, StarRating, PriceTag } from "../shared/Bits";
import Reveal from "../shared/Reveal";

const featuredDestinations = destinations.slice(0, 8);

export function FeaturedDestinations() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Where To Next"
            title="Featured Destinations"
            subtitle="Handpicked places our travellers keep returning to, from Himalayan passes to sunlit coasts."
          />
          <Reveal>
            <Link to="/destinations" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 mb-14">
              View All Destinations <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredDestinations.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.05}>
              <Link to={`/destinations/${d.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                  <img
                    src={d.image}
                    alt={`${d.name} — ${d.tagline}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-white">{d.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{d.packageCount} packages</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-gold-300">₹{d.startingPrice.toLocaleString("en-IN")}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white transition-transform group-hover:translate-x-0.5 group-hover:bg-terracotta-500">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/destinations" className="btn-secondary">View All Destinations</Link>
        </div>
      </div>
    </section>
  );
}

export function PopularPackages() {
  return (
    <section id="packages" className="py-16 sm:py-24 bg-white">
      <div className="container-lg">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Best Sellers"
            title="Popular Tour Packages"
            subtitle="Thoughtfully paced itineraries, transparent pricing, and every detail sorted before you arrive."
          />
          <Reveal>
            <Link to="/tours" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 mb-14">
              View All Tours <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t, i) => (
            <Reveal key={t.slug} delay={(i % 3) * 0.08}>
              <div className="card-surface overflow-hidden group h-full flex flex-col hover:shadow-lift hover:-translate-y-1">
                <Link to={`/tours/${t.slug}`} className="relative block overflow-hidden aspect-[4/3]">
                  <img
                    src={t.image}
                    alt={`${t.title} tour package`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
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
                    <h3 className="font-display text-lg font-semibold text-navy-900 mt-2 hover:text-terracotta-600 transition-colors">
                      {t.title}
                    </h3>
                  </Link>
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-navy-500">
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {t.duration}</span>
                    <span className="flex items-center gap-1.5"><Users size={13} /> {t.groupSize}</span>
                    <span className="flex items-center gap-1.5"><Hotel size={13} /> {t.hotelCategory}</span>
                    <span className="flex items-center gap-1.5"><Car size={13} /> {t.transport}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between">
                    <PriceTag original={t.originalPrice} price={t.price} />
                  </div>
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
        <div className="mt-10 text-center">
          <Link to="/tours" className="btn-secondary">View All Tour Packages</Link>
        </div>
      </div>
    </section>
  );
}
