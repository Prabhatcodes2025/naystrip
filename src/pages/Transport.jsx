import { Users, Briefcase, Snowflake, CheckCircle2, MessageCircle } from "lucide-react";
import { transportFleet } from "../data/content";
import { PageBanner } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

export default function Transport() {
  return (
    <>
      <Seo title="Transport &amp; Vehicle Rentals | NaysTrip & Treks" description="Request transport for groups, holidays and airport transfers." />
      <PageBanner
        eyebrow="Move With Ease"
        title="Transport Services"
        subtitle="Well-maintained vehicles and experienced drivers, matched to your group size and route."
        image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {transportFleet.map((v, i) => (
              <Reveal key={v.name} delay={(i % 4) * 0.06}>
                <div className="card-surface overflow-hidden h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={v.image} alt={v.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-semibold text-navy-900">{v.name}</h3>
                    <div className="mt-3 space-y-1.5 text-xs text-navy-500">
                      <span className="flex items-center gap-1.5"><Users size={13} /> {v.seats}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={13} /> {v.luggage}</span>
                      {v.ac && <span className="flex items-center gap-1.5"><Snowflake size={13} /> AC Available</span>}
                      <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> {v.bestFor}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-navy-900">{v.priceText}</span>
                      <a href="/contact" className="rounded-full bg-terracotta-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors">
                        Inquire
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-navy-950 p-8 sm:p-12 text-center">
            <h3 className="font-display text-2xl font-semibold text-white">Need a vehicle for a large group or event?</h3>
            <p className="text-white/60 mt-2 max-w-lg mx-auto text-sm">Talk to our transport team for custom fleet arrangements, multi-day rentals and corporate contracts.</p>
            <a href="/contact" className="btn-primary mt-6 inline-flex">
              <MessageCircle size={16} /> Get a Custom Quote
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
