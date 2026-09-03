import { Link } from "react-router-dom";
import { Mountain, Gauge, Navigation, Clock } from "lucide-react";
import { treks, expeditions } from "../data/treksExpeditions";
import { PageBanner } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import SmartImage from "../components/shared/SmartImage";

function TrekGrid({ items }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((t, i) => (
        <Reveal key={t.slug} delay={(i % 4) * 0.07}>
          <Link to={`/treks/${t.slug}`} className="card-surface overflow-hidden group hover:shadow-lift hover:-translate-y-1 transition-all block">
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage src={t.image} context={`${t.name} ${t.category}`} alt={t.name} loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute top-3 left-3 rounded-full bg-navy-950/70 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-gold-300">
                {t.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-base font-semibold text-navy-900">{t.name}</h3>
              <p className="text-xs text-navy-400 mt-0.5">{t.country}</p>
              <div className="mt-3 space-y-1.5 text-xs text-navy-500">
                <span className="flex items-center gap-1.5"><Mountain size={13} /> Max Altitude {t.maxAltitude}</span>
                <span className="flex items-center gap-1.5"><Gauge size={13} /> {t.difficulty}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {t.duration}</span>
                <span className="flex items-center gap-1.5"><Navigation size={13} /> {t.bestSeason}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-navy-100 text-sm font-bold text-navy-900">
                From ₹{t.price.toLocaleString("en-IN")}
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function Treks() {
  return (
    <>
      <Seo title="Himalayan Treks | NaysTrip & Treks" description="Explore trek routes and request current batch, leader and safety details." />
      <PageBanner
        eyebrow="For The Bold"
        title="Treks"
        subtitle="Guided journeys into the mountains, with safety and pacing built into every itinerary."
        image="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?fm=webp&fit=crop&w=1600&q=80"
        imageAlt="Mountain valley and snow-capped peaks"
      />
      <section className="py-10 sm:py-14"><div className="container-lg"><TrekGrid items={treks} /></div></section>
    </>
  );
}

export function Expeditions() {
  return (
    <>
      <Seo title="Mountain Expeditions | NaysTrip & Treks" description="Explore expedition routes and request current permits, batch and leader details." />
      <PageBanner
        eyebrow="Technical Climbs"
        title="Expeditions"
        subtitle="Peaks that demand training, teamwork and the right support system — all provided."
        image="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
      />
      <section className="py-10 sm:py-14"><div className="container-lg"><TrekGrid items={expeditions} /></div></section>
    </>
  );
}
