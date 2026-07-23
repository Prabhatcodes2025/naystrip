import { Link } from "react-router-dom";
import { howItWorksSteps, whyChooseUs } from "../data/content";
import { PageBanner, SectionHeading } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import { CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <>
      <Seo title="How It Works | Altiora Journeys" description="See how easy it is to plan your trip with Altiora Journeys, from first inquiry to departure." />
      <PageBanner
        eyebrow="Simple, Start To Finish"
        title="How It Works"
        subtitle="From your first message to landing at your destination — here's exactly what to expect."
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
      />
      <section className="py-14 sm:py-20">
        <div className="container-lg">
          <div className="relative grid sm:grid-cols-3 gap-10 sm:gap-6 mb-20">
            <div className="hidden sm:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-navy-100" />
            {howItWorksSteps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-xl font-display font-bold text-gold-300 relative z-10">
                  {s.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-900 mt-5">{s.title}</h3>
                <p className="text-sm text-navy-500 mt-2 max-w-xs mx-auto leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>

          <SectionHeading eyebrow="What You Get" title="Every Trip Includes" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyChooseUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 4) * 0.06}>
                <div className="card-surface p-5 h-full">
                  <CheckCircle2 size={20} className="text-forest-500 mb-2" />
                  <h4 className="text-sm font-semibold text-navy-900">{w.title}</h4>
                  <p className="text-xs text-navy-500 mt-1 leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/custom-trip" className="btn-primary">Start Planning Your Trip</Link>
          </div>
        </div>
      </section>
    </>
  );
}
