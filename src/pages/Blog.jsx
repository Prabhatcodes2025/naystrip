import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { blogs } from "../data/content";
import { getAdminBlogs } from "../utils/storage";
import { PageBanner } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const allBlogs = useMemo(() => {
    const published = getAdminBlogs().filter((b) => b.published !== false);
    return [...published, ...blogs];
  }, []);

  const categories = ["All", ...Array.from(new Set(allBlogs.map((b) => b.category)))];

  const filtered = allBlogs.filter((b) => {
    if (category !== "All" && b.category !== category) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Seo title="Travel Blog | Altiora Journeys" description="Destination guides, packing lists and travel tips from our team of travel experts." />
      <PageBanner
        eyebrow="Travel Inspiration"
        title="The Journal"
        subtitle="Guides, tips and stories to help you plan better trips."
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-14">
        <div className="container-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative sm:max-w-md w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="input-field pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                    category === c ? "bg-navy-900 text-white border-navy-900" : "border-navy-200 text-navy-600 hover:border-navy-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((b, i) => (
              <Reveal key={b.slug || b.id} delay={(i % 3) * 0.07}>
                <div className="card-surface overflow-hidden group h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                  <Link to={`/blog/${b.slug || b.id}`} className="block relative aspect-[16/10] overflow-hidden">
                    <img src={b.image} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-navy-800">
                      {b.category}
                    </span>
                  </Link>
                  <div className="p-5">
                    <span className="flex items-center gap-1.5 text-xs text-navy-400">
                      <Calendar size={12} /> {new Date(b.date || b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Link to={`/blog/${b.slug || b.id}`}>
                      <h3 className="font-display text-lg font-semibold text-navy-900 mt-2 hover:text-terracotta-600 transition-colors line-clamp-2">{b.title}</h3>
                    </Link>
                    <p className="text-sm text-navy-500 mt-2 line-clamp-2 leading-relaxed">{b.excerpt}</p>
                    <Link to={`/blog/${b.slug || b.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700">
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
