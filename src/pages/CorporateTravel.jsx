import { Briefcase, Award, Building2, Users, Mic2, MessageCircle } from "lucide-react";
import { corporateServices } from "../data/content";
import { PageBanner, SectionHeading } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

const icons = [Briefcase, Award, Building2, Users, Mic2];

export default function CorporateTravel() {
  return (
    <>
      <Seo title="Corporate Travel Services | Altiora Journeys" description="Dedicated corporate travel management for offsites, incentive trips, MICE and conference travel." />
      <PageBanner
        eyebrow="For Businesses"
        title="Corporate Travel"
        subtitle="Professional, precisely managed travel for teams — from single business trips to company-wide offsites."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-14 sm:py-20">
        <div className="container-lg">
          <SectionHeading
            eyebrow="Our Corporate Offerings"
            title="Travel Management Built For Business"
            subtitle="Every engagement comes with a dedicated account manager, transparent invoicing and 24/7 on-trip support."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporateServices.map((c, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Reveal key={c.title} delay={(i % 3) * 0.07}>
                  <div className="card-surface p-6 h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-300 mb-4">
                      <Icon size={22} />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-navy-900">{c.title}</h3>
                    <p className="text-sm text-navy-500 mt-2 leading-relaxed">{c.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80"
                alt="Corporate team retreat planning session"
                loading="lazy"
                className="rounded-3xl w-full aspect-[4/3] object-cover"
              />
            </Reveal>
            <Reveal>
              <h3 className="font-display text-2xl font-semibold text-navy-900">Why teams choose us for business travel</h3>
              <ul className="mt-5 space-y-3 text-sm text-navy-600">
                <li>• Single point of contact for all logistics, from flights to venue coordination.</li>
                <li>• Volume-based pricing and consolidated, GST-compliant invoicing.</li>
                <li>• Real-time itinerary changes with 24/7 support during the trip.</li>
                <li>• Curated venue and activity options for offsites and incentive travel.</li>
              </ul>
              <a href="/contact" className="btn-primary mt-8 inline-flex">
                <MessageCircle size={16} /> Talk to Our Corporate Team
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
