import { Link } from "react-router-dom";
import { Plane, Hotel, Car, Map, Home, Calendar, Globe, ShieldCheck } from "lucide-react";
import { services, holidayCategories } from "../../data/content";
import { SectionHeading } from "../shared/Bits";
import Reveal from "../shared/Reveal";

const iconMap = { Plane, Hotel, Car, Map, Home, Calendar, Globe, ShieldCheck };

export function ServicesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <SectionHeading
          eyebrow="What We Offer"
          title="Everything Your Trip Needs, In One Place"
          subtitle="From flights to fixed departures, we handle each moving part so you don't have to."
          center
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <Reveal key={s.title} delay={(i % 4) * 0.06}>
                <div className="card-surface p-5 sm:p-6 h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600 mb-4">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-navy-900">{s.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-navy-500 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HolidayCategoriesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-lg">
        <SectionHeading
          eyebrow="Travel Your Way"
          title="Holiday Categories"
          subtitle="Whichever kind of trip you're picturing, there's a curated collection built around it."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {holidayCategories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 4) * 0.06}>
              <Link to={`/holidays?category=${c.slug}`} className="group relative block overflow-hidden rounded-2xl aspect-square">
                <img
                  src={c.image}
                  alt={`${c.name} holidays`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-white">{c.name}</h3>
                  <p className="text-[11px] text-white/70">{c.count} packages</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
