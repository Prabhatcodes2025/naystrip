import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { blogs } from "../../data/content";
import { SectionHeading } from "../shared/Bits";
import Reveal from "../shared/Reveal";
import { getSiteSettings } from "../../data/siteConfig";

export function BlogSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Travel Inspiration"
            title="From The Journal"
            subtitle="Guides, itinerary tips and destination deep-dives from our travel experts."
          />
          <Reveal>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 mb-14">
              Visit The Blog <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.08}>
              <div className="card-surface overflow-hidden group h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                <Link to={`/blog/${b.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                  <img src={b.image} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-navy-800">
                    {b.category}
                  </span>
                </Link>
                <div className="p-5">
                  <span className="flex items-center gap-1.5 text-xs text-navy-400">
                    <Calendar size={12} /> {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <Link to={`/blog/${b.slug}`}>
                    <h3 className="font-display text-lg font-semibold text-navy-900 mt-2 hover:text-terracotta-600 transition-colors line-clamp-2">
                      {b.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-navy-500 mt-2 line-clamp-2 leading-relaxed">{b.excerpt}</p>
                  <Link to={`/blog/${b.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700">
                    Read More <ArrowRight size={14} />
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

export function FinalCTASection() {
  const settings = getSiteSettings();
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80"
        alt="Traveller watching sunrise over mountain range"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy-950/75" />
      <div className="container-lg relative z-10 text-center">
        <Reveal>
          <span className="eyebrow text-gold-300 mb-4 block">Ready When You Are</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white max-w-2xl mx-auto text-shadow-sm">
            {settings.homepageCtaText}
          </h2>
          <p className="text-white/75 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Whether it's a spontaneous weekend escape or the trip you've been planning for years — let's design it together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/custom-trip" className="btn-primary">Plan My Trip</Link>
            <a href="/contact" className="btn-ghost-light">
              <MessageCircle size={16} /> Talk to a Travel Expert
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
