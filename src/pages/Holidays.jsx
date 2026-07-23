import { Link, useSearchParams } from "react-router-dom";
import { holidayCategories } from "../data/content";
import { tours } from "../data/tours";
import { PageBanner, SectionHeading, StarRating, PriceTag } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

export default function Holidays() {
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "all";

  return (
    <>
      <Seo title="Holiday Categories | Altiora Journeys" description="Browse holidays by category — adventure, honeymoon, family, luxury, wildlife and more." />
      <PageBanner
        eyebrow="Travel Your Way"
        title="Holidays By Category"
        subtitle="Every kind of trip, curated around what actually matters to you."
        image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setParams({})}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                active === "all" ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
              }`}
            >
              All
            </button>
            {holidayCategories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setParams({ category: c.slug })}
                className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                  active === c.slug ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {holidayCategories
              .filter((c) => active === "all" || c.slug === active)
              .map((c, i) => (
                <Reveal key={c.slug} delay={(i % 4) * 0.06}>
                  <div className="relative rounded-2xl overflow-hidden aspect-square group">
                    <img src={c.image} alt={`${c.name} holidays`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
                      <p className="text-xs text-white/70">{c.count} packages</p>
                    </div>
                  </div>
                </Reveal>
              ))}
          </div>

          <SectionHeading eyebrow="Recommended For You" title="Popular Holiday Packages" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((t) => (
              <Reveal key={t.slug}>
                <Link to={`/tours/${t.slug}`} className="card-surface overflow-hidden group hover:shadow-lift hover:-translate-y-1 transition-all block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={t.image} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <StarRating rating={t.rating} />
                    <h3 className="font-display text-base font-semibold text-navy-900 mt-2">{t.title}</h3>
                    <p className="text-xs text-navy-400 mt-1">{t.duration} · {t.tripType}</p>
                    <div className="mt-3 pt-3 border-t border-navy-100">
                      <PriceTag original={t.originalPrice} price={t.price} />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
