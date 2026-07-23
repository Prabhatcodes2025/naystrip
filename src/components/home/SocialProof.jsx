import { Play, Quote } from "lucide-react";
import { testimonials, googleReviews } from "../../data/content";
import { SectionHeading, StarRating } from "../shared/Bits";
import Reveal from "../shared/Reveal";

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lg">
        <SectionHeading
          eyebrow="Happy Travellers"
          title="Stories From The Road"
          subtitle="Real trips, real travellers — a glimpse of the experiences we've helped create."
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <Reveal className="lg:col-span-1">
            <div className="relative h-full min-h-[280px] rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80"
                alt="Featured traveller story — sunrise trek in the Himalayas"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-terracotta-500 group-hover:scale-110 transition-transform">
                  <Play size={22} className="ml-1" fill="currentColor" />
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-sm">"The sunrise at Kedarkantha summit — worth every step."</p>
                <p className="text-white/60 text-xs mt-1">Featured Story · Sneha K.</p>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {testimonials.slice(0, 4).map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 0.08}>
                <div className="card-surface p-5 h-full relative">
                  <Quote size={26} className="text-terracotta-100 absolute top-4 right-4" />
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-semibold text-navy-900">{t.name}</h4>
                      <p className="text-xs text-navy-400">{t.destination}</p>
                    </div>
                  </div>
                  <StarRating rating={t.rating} size={12} showValue={false} />
                  <p className="text-sm text-navy-600 mt-2.5 leading-relaxed">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GoogleReviewsSection() {
  const avg = (googleReviews.reduce((a, r) => a + r.rating, 0) / googleReviews.length).toFixed(1);
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-lg">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <span className="eyebrow mb-3 block">Verified Feedback</span>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="section-title">What Travellers Say on Google</h2>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="font-display text-3xl font-bold text-navy-900">{avg}</span>
              <StarRating rating={Number(avg)} showValue={false} size={18} />
              <span className="text-sm text-navy-400">based on illustrative reviews</span>
            </div>
          </div>
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-6 sm:mt-0"
          >
            View More Reviews
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {googleReviews.map((r, i) => (
            <Reveal key={r.name} delay={(i % 4) * 0.07}>
              <div className="card-surface p-5 h-full">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    {r.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.8 14.1-5l-6.5-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.4C39.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
                </div>
                <h4 className="text-sm font-semibold text-navy-900 mt-3">{r.name}</h4>
                <StarRating rating={r.rating} showValue={false} size={12} />
                <p className="text-xs text-navy-500 mt-2 leading-relaxed line-clamp-3">{r.text}</p>
                <p className="text-[11px] text-navy-300 mt-2">{r.date}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-xs text-navy-400 mt-6 text-center">
          Reviews shown are illustrative examples of the feedback we typically receive and are not pulled from a live feed.
        </p>
      </div>
    </section>
  );
}
