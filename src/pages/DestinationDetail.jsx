import { Link, useParams, Navigate } from "react-router-dom";
import { Sun, Cloud, MapPinned, Lightbulb, MessageCircle } from "lucide-react";
import { getDestinationBySlug } from "../data/destinations";
import { tours } from "../data/tours";
import { blogs } from "../data/content";
import { PageBanner, SectionHeading } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

export default function DestinationDetail() {
  const { slug } = useParams();
  const destination = getDestinationBySlug(slug);
  if (!destination) return <Navigate to="/destinations" replace />;

  const relatedTours = tours.filter((t) => t.destination.toLowerCase().includes(destination.name.split(" ")[0].toLowerCase()));
  const relatedBlogs = blogs.filter((b) => b.relatedDestination === destination.slug);

  return (
    <>
      <Seo title={`${destination.name} Travel Guide | NaysTrip & Treks`} description={destination.overview} />
      <PageBanner eyebrow={destination.region} title={destination.name} subtitle={destination.tagline} image={destination.image} />

      <section className="py-12 sm:py-16">
        <div className="container-lg grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-3">Overview</h2>
              <p className="text-navy-600 leading-relaxed">{destination.overview}</p>
            </Reveal>

            <Reveal>
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3 rounded-xl bg-navy-50/60 p-4">
                  <Sun size={18} className="text-gold-600 shrink-0 mt-0.5" />
                  <div><p className="text-xs text-navy-400">Best Time to Visit</p><p className="text-sm font-semibold text-navy-800">{destination.bestTime}</p></div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-navy-50/60 p-4">
                  <Cloud size={18} className="text-navy-500 shrink-0 mt-0.5" />
                  <div><p className="text-xs text-navy-400">Weather</p><p className="text-sm text-navy-700">{destination.weather}</p></div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10">
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <MapPinned size={20} className="text-terracotta-500" /> Popular Attractions
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {destination.attractions.map((a) => (
                    <div key={a} className="rounded-xl bg-white border border-navy-100 px-4 py-3 text-sm font-medium text-navy-700 shadow-soft">
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10">
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-gold-500" /> Travel Tips
                </h3>
                <ul className="space-y-3">
                  {destination.travelTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-navy-600">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terracotta-400 shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {relatedBlogs.length > 0 && (
              <div className="mt-12">
                <SectionHeading eyebrow="Read More" title="Related Blogs" />
                <div className="grid sm:grid-cols-2 gap-5">
                  {relatedBlogs.map((b) => (
                    <Link key={b.slug} to={`/blog/${b.slug}`} className="card-surface overflow-hidden group hover:shadow-lift transition-all flex gap-4 p-3">
                      <img src={b.image} alt={b.title} loading="lazy" className="h-20 w-20 rounded-lg object-cover shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-navy-900 line-clamp-2 group-hover:text-terracotta-600 transition-colors">{b.title}</h4>
                        <p className="text-xs text-navy-400 mt-1">{b.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="card-surface p-6">
                <p className="text-xs text-navy-400">Packages starting from</p>
                <p className="font-display text-2xl font-bold text-navy-900">₹{destination.startingPrice.toLocaleString("en-IN")}</p>
                <p className="text-xs text-navy-400 mt-1">{destination.packageCount} curated packages available</p>
                <Link to={`/tours?destination=${destination.name}`} className="btn-primary w-full mt-5">Explore Packages</Link>
                <Link to="/contact" className="btn-secondary w-full mt-3">
                  <MessageCircle size={16} /> Enquire Now
                </Link>
              </div>

              {relatedTours.length > 0 && (
                <div className="card-surface p-5">
                  <h4 className="font-display text-base font-semibold text-navy-900 mb-4">Popular Packages Here</h4>
                  <div className="space-y-4">
                    {relatedTours.slice(0, 2).map((t) => (
                      <Link key={t.slug} to={`/tours/${t.slug}`} className="flex gap-3 group">
                        <img src={t.image} alt={t.title} loading="lazy" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-navy-800 line-clamp-2 group-hover:text-terracotta-600">{t.title}</p>
                          <p className="text-xs text-navy-400 mt-1">₹{t.price.toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
