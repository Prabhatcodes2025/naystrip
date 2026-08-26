import { useParams, Navigate, Link } from "react-router-dom";
import { Calendar, Facebook, Twitter, Linkedin, Link2 } from "lucide-react";
import { blogs, getBlogBySlug } from "../data/content";
import { getDestinationBySlug } from "../data/destinations";
import { tours } from "../data/tours";
import { getPublicBlogs } from "../utils/storage";
import { PageBanner, SectionHeading } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import { useEffect, useState } from "react";
import { PageLoader } from "../components/shared/Loading";

export default function BlogDetail() {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);
  const [publicBlogs,setPublicBlogs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{getPublicBlogs().then(setPublicBlogs).catch(()=>setPublicBlogs([])).finally(()=>setLoading(false))},[]);
  const adminBlog = publicBlogs.find((b) => b.slug === slug || b.id === slug);
  const blog = adminBlog || getBlogBySlug(slug);

  if (loading&&!blog) return <PageLoader label="Loading article…"/>;
  if (!blog) return <Navigate to="/blog" replace />;

  const destination = blog.relatedDestination ? getDestinationBySlug(blog.relatedDestination) : null;
  const relatedTours = destination ? tours.filter((t) => t.destination.toLowerCase().includes(destination.name.split(" ")[0].toLowerCase())).slice(0, 2) : [];
  const relatedBlogs = blogs.filter((b) => b.slug !== blog.slug).slice(0, 3);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo title={blog.seoTitle || `${blog.title} | NaysTrip & Treks Blog`} description={blog.seoDescription || blog.excerpt} />
      <PageBanner eyebrow={blog.category} title={blog.title} subtitle={blog.subtitle || blog.excerpt} image={blog.image} />

      <section className="py-12 sm:py-16">
        <div className="container-lg grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Reveal>
              <span className="flex items-center gap-1.5 text-xs text-navy-400 mb-6">
                <Calendar size={13} /> {new Date(blog.date || blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}{blog.author ? ` · ${blog.author}` : ""}
              </span>
              <p className="text-navy-600 leading-relaxed text-base whitespace-pre-line">{blog.content}</p>
            </Reveal>

            <div className="mt-10 pt-6 border-t border-navy-100 flex items-center gap-3">
              <span className="text-sm font-semibold text-navy-700">Share this article:</span>
              <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-white transition-colors"><Facebook size={15} /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-white transition-colors"><Twitter size={15} /></a>
              <a href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-white transition-colors"><Linkedin size={15} /></a>
              <button onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-600 hover:bg-navy-900 hover:text-white transition-colors"><Link2 size={15} /></button>
              {copied && <span className="text-xs text-forest-600 font-semibold">Link copied!</span>}
            </div>

            {relatedBlogs.length > 0 && (
              <div className="mt-14">
                <SectionHeading eyebrow="Continue Reading" title="Related Blogs" />
                <div className="grid sm:grid-cols-3 gap-5">
                  {relatedBlogs.map((b) => (
                    <Link key={b.slug} to={`/blog/${b.slug}`} className="card-surface overflow-hidden group hover:shadow-lift transition-all">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={b.image} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-navy-900 line-clamp-2 group-hover:text-terracotta-600 transition-colors">{b.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 space-y-5">
              {destination && (
                <div className="card-surface overflow-hidden">
                  <img src={destination.image} alt={destination.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <h4 className="font-display text-base font-semibold text-navy-900">{destination.name}</h4>
                    <p className="text-xs text-navy-500 mt-1">{destination.tagline}</p>
                    <Link to={`/destinations/${destination.slug}`} className="btn-secondary w-full mt-4 !py-2.5 !text-xs">View Destination Guide</Link>
                  </div>
                </div>
              )}
              {relatedTours.length > 0 && (
                <div className="card-surface p-5">
                  <h4 className="font-display text-base font-semibold text-navy-900 mb-4">Related Packages</h4>
                  <div className="space-y-4">
                    {relatedTours.map((t) => (
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
              <div className="card-surface p-5 bg-navy-950 border-none">
                <h4 className="font-display text-base font-semibold text-white">Need help planning?</h4>
                <p className="text-xs text-white/60 mt-1.5">Talk to a travel expert about this destination.</p>
                <Link to="/contact" className="btn-primary w-full mt-4 !py-2.5 !text-xs">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
