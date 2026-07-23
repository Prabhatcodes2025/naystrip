import { useSearchParams } from "react-router-dom";
import { Calendar, Users2, Clock } from "lucide-react";
import { fixedDepartures } from "../data/content";
import { PageBanner, PriceTag, EmptyState } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

const types = ["All", "Tour", "Trek", "Expedition", "Volvo Package"];

export default function FixedDepartures() {
  const [params, setParams] = useSearchParams();
  const active = params.get("type") || "All";

  const filtered = fixedDepartures.filter((d) => active === "All" || d.type === active);

  return (
    <>
      <Seo title="Fixed Departures | Altiora Journeys" description="Join our upcoming fixed-date tours, treks, expeditions and Volvo packages — no planning required." />
      <PageBanner
        eyebrow="Set Dates"
        title="Fixed Departures"
        subtitle="Small-group trips with confirmed dates, ready for you to join."
        image="https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="flex flex-wrap gap-2 mb-10">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setParams(t === "All" ? {} : { type: t })}
                className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                  active === t ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No departures found" subtitle="Check back soon for new dates." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((d, i) => (
                <Reveal key={d.id} delay={(i % 3) * 0.07}>
                  <div className="card-surface p-6 h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                    <span className="badge-pill mb-3">{d.type}</span>
                    <h3 className="font-display text-lg font-semibold text-navy-900">{d.destination}</h3>
                    <div className="mt-4 space-y-2 text-sm text-navy-500">
                      <span className="flex items-center gap-2"><Calendar size={15} /> {d.date}</span>
                      <span className="flex items-center gap-2"><Clock size={15} /> {d.duration}</span>
                      <span className="flex items-center gap-2"><Users2 size={15} /> {d.seatsLeft} seats left</span>
                    </div>
                    <div className="mt-5 pt-5 border-t border-navy-100 flex items-center justify-between">
                      <PriceTag price={d.price} />
                      <a href="/contact" className="rounded-full bg-terracotta-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors">
                        Reserve Seat
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
