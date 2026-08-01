import { Link } from "react-router-dom";
import { Briefcase, Award, Users, Building2, Mic2, ArrowRight, CheckCircle2 } from "lucide-react";
import { corporateServices, howItWorksSteps, whyChooseUs } from "../../data/content";
import { SectionHeading } from "../shared/Bits";
import Counter from "../shared/Counter";
import Reveal from "../shared/Reveal";

const corpIcons = [Briefcase, Award, Building2, Users, Mic2];

export function CorporateTravelSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Corporate travel and business retreat planning"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass-panel !bg-white/15 p-4">
                <p className="text-white text-sm font-semibold">Dedicated group logistics from first brief to return travel.</p>
                <p className="text-white/60 text-xs mt-1">— HR Director, leading fintech company</p>
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="For Businesses"
              title="Corporate Travel, Handled With Precision"
              subtitle="Dedicated account managers, transparent billing and on-ground support for teams of any size."
            />
            <div className="grid sm:grid-cols-2 gap-4">
              {corporateServices.map((c, i) => {
                const Icon = corpIcons[i % corpIcons.length];
                return (
                  <Reveal key={c.title} delay={i * 0.06}>
                    <div className="flex items-start gap-3 rounded-xl bg-navy-50/60 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                        <Icon size={16} />
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-navy-900">{c.title}</h4>
                        <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <Link to="/corporate-travel" className="btn-secondary mt-6 inline-flex">
              Explore Corporate Travel <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-lg">
        <SectionHeading eyebrow="Simple, Start To Finish" title="How It Works" center />
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
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
      </div>
    </section>
  );
}

export function WhyChooseUsSection() {
  return (
    <section className="py-16 sm:py-24 bg-navy-950 text-white">
      <div className="container-lg">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="Why Travel With Us"
              title="Built On Trust, Not Just Itineraries"
              subtitle="A decade of getting the details right — so your only job is to enjoy the trip."
              light
            />
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div>
                <Counter to={10000} suffix="+" className="font-display text-2xl sm:text-3xl font-bold text-gold-300" />
                <p className="text-xs text-white/50 mt-1">Happy Travellers</p>
              </div>
              <div>
                <Counter to={250} suffix="+" className="font-display text-2xl sm:text-3xl font-bold text-gold-300" />
                <p className="text-xs text-white/50 mt-1">Curated Trips</p>
              </div>
              <div>
                <Counter to={12} className="font-display text-2xl sm:text-3xl font-bold text-gold-300" />
                <p className="text-xs text-white/50 mt-1">Years of Trust</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {whyChooseUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 4) * 0.06}>
                <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4 border border-white/10">
                  <CheckCircle2 size={18} className="shrink-0 text-forest-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{w.title}</h4>
                    <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
