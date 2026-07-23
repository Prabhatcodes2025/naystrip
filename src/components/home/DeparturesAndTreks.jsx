import { Link } from "react-router-dom";
import { Calendar, Users2, Clock, ArrowRight, Mountain, Gauge, Navigation } from "lucide-react";
import { fixedDepartures, weekendGetaways } from "../../data/content";
import { treks, expeditions } from "../../data/treksExpeditions";
import { SectionHeading, PriceTag } from "../shared/Bits";
import Reveal from "../shared/Reveal";

export function FixedDeparturesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Set Dates, Zero Planning"
            title="Upcoming Fixed Departures"
            subtitle="Join a small group of like-minded travellers on tours, treks, expeditions and Volvo getaways."
          />
          <Reveal>
            <Link to="/fixed-departures" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 mb-14">
              View All Departures <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {fixedDepartures.slice(0, 8).map((d, i) => (
            <Reveal key={d.id} delay={(i % 4) * 0.06} className="shrink-0 w-64 sm:w-auto">
              <div className="card-surface p-5 h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                <span className="badge-pill mb-3">{d.type}</span>
                <h3 className="font-display text-base font-semibold text-navy-900">{d.destination}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-navy-500">
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> {d.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {d.duration}</span>
                  <span className="flex items-center gap-1.5"><Users2 size={13} /> {d.seatsLeft} seats left</span>
                </div>
                <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between">
                  <PriceTag price={d.price} />
                  <Link to="/fixed-departures" className="rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-800 transition-colors">
                    Book
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TreksExpeditionsSection() {
  const cards = [...treks.slice(0, 2), ...expeditions.slice(0, 2)];
  return (
    <section className="py-16 sm:py-24 bg-navy-950 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=60"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
      />
      <div className="container-lg relative z-10">
        <SectionHeading
          eyebrow="For The Bold"
          title="Treks &amp; Expeditions"
          subtitle="Guided journeys into the high Himalayas, led by experienced mountaineers with safety built into every step."
          light
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((t, i) => (
            <Reveal key={t.slug} delay={(i % 4) * 0.07}>
              <Link to={`/treks/${t.slug}`} className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-gold-400/40 transition-colors">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-3 left-3 rounded-full bg-navy-950/70 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-gold-300">
                    {t.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-white">{t.name}</h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-white/60">
                    <span className="flex items-center gap-1.5"><Mountain size={13} /> Max Altitude {t.maxAltitude}</span>
                    <span className="flex items-center gap-1.5"><Gauge size={13} /> {t.difficulty}</span>
                    <span className="flex items-center gap-1.5"><Navigation size={13} /> {t.bestSeason}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 text-sm font-bold text-gold-300">
                    From ₹{t.price.toLocaleString("en-IN")}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/treks" className="btn-ghost-light">Explore All Treks</Link>
          <Link to="/expeditions" className="btn-primary">Explore All Expeditions</Link>
        </div>
      </div>
    </section>
  );
}

export function WeekendGetawaysSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-lg">
        <SectionHeading
          eyebrow="Short On Time?"
          title="Weekend Getaways"
          subtitle="Quick escapes within driving distance — perfect when you can't get away for long."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {weekendGetaways.map((g, i) => (
            <Reveal key={g.name} delay={(i % 4) * 0.07}>
              <div className="card-surface overflow-hidden group hover:shadow-lift hover:-translate-y-1 transition-all">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={g.image} alt={g.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-navy-900">{g.name}</h3>
                  <p className="text-xs text-navy-500 mt-1">{g.driveTime}</p>
                  <p className="text-xs text-navy-500">{g.duration}</p>
                  <div className="mt-3 pt-3 border-t border-navy-100 flex items-center justify-between">
                    <PriceTag price={g.price} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
