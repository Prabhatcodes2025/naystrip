import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  MapPin, Clock, Users, Hotel, Car, Download, FileText, MessageCircle,
  CheckCircle2, XCircle, Info, ShieldQuestion, ChevronDown, Image as ImageIcon,
} from "lucide-react";
import { getTourBySlug, tours } from "../data/tours";
import { StarRating, PriceTag, SectionHeading } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import { saveContactLead } from "../utils/storage";
import { getSiteSettings } from "../data/siteConfig";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "price", label: "Price Details" },
  { id: "gallery", label: "Gallery" },
  { id: "faqs", label: "FAQs" },
];

export default function TourDetails() {
  const { slug } = useParams();
  const tour = getTourBySlug(slug);
  const [activeTab, setActiveTab] = useState("overview");
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(null);
  const settings = getSiteSettings();

  if (!tour) return <Navigate to="/tours" replace />;

  const related = tours.filter((t) => t.slug !== tour.slug && t.destination === tour.destination).slice(0, 3);
  const relatedFallback = tours.filter((t) => t.slug !== tour.slug).slice(0, 3);
  const relatedTours = related.length ? related : relatedFallback;

  const handleInquiry = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const entry = saveContactLead({ ...form, destination: tour.destination, source: `Tour: ${tour.title}` });
    setSubmitted(entry.id);
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  const handleDownload = () => {
    const content = `${tour.title}\n${tour.duration} | ${tour.destination}\n\nOVERVIEW\n${tour.overview}\n\nITINERARY\n${tour.itinerary
      .map((d) => `Day ${d.day}: ${d.title} — ${d.details}`)
      .join("\n")}\n\nINCLUSIONS\n${tour.inclusions.map((i) => `- ${i}`).join("\n")}\n\nEXCLUSIONS\n${tour.exclusions
      .map((i) => `- ${i}`)
      .join("\n")}\n\nStarting Price: ₹${tour.price.toLocaleString("en-IN")}\n\nContact ${settings.brandName} — ${settings.phone} | ${settings.email}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tour.slug}-itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const waLink = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi! I'd like more details about the ${tour.title} package.`
  )}`;

  return (
    <>
      <Seo title={`${tour.title} | ${tour.duration} | Altiora Journeys`} description={tour.overview} />

      {/* Gallery */}
      <section className="container-lg pt-6 sm:pt-10">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3 h-[320px] sm:h-[440px] rounded-2xl overflow-hidden">
          <div className="col-span-4 sm:col-span-2 row-span-2 relative">
            <img src={tour.gallery[0]} alt={`${tour.title} main view`} className="h-full w-full object-cover" loading="eager" />
          </div>
          {tour.gallery.slice(1, 4).map((img, i) => (
            <div key={i} className="hidden sm:block col-span-1 row-span-1 relative">
              <img src={img} alt={`${tour.title} view ${i + 2}`} className="h-full w-full object-cover" loading="lazy" />
              {i === 2 && (
                <div className="absolute inset-0 bg-navy-950/50 flex items-center justify-center text-white text-sm font-semibold gap-1.5">
                  <ImageIcon size={16} /> View Gallery
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-lg grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <span className="badge-pill mb-3">{tour.tripType}</span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-navy-900">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-500">
              <span className="flex items-center gap-1.5"><MapPin size={15} /> {tour.destination}</span>
              <StarRating rating={tour.rating} />
              <span>{tour.reviews} reviews</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> {tour.duration}</span>
              <span className="flex items-center gap-1.5"><Users size={15} /> {tour.groupSize}</span>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-navy-100 flex gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === t.id ? "border-terracotta-500 text-terracotta-600" : "border-transparent text-navy-500 hover:text-navy-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeTab === "overview" && (
                <Reveal>
                  <p className="text-navy-600 leading-relaxed">{tour.overview}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 rounded-xl bg-navy-50/60 p-4">
                      <Hotel size={18} className="text-forest-600" />
                      <div><p className="text-xs text-navy-400">Accommodation</p><p className="text-sm font-semibold text-navy-800">{tour.accommodation}</p></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-navy-50/60 p-4">
                      <Car size={18} className="text-forest-600" />
                      <div><p className="text-xs text-navy-400">Transport</p><p className="text-sm font-semibold text-navy-800">{tour.transportDetails}</p></div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-start gap-3 rounded-xl bg-gold-50 p-4">
                    <Info size={18} className="text-gold-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-navy-700">{tour.importantInfo}</p>
                  </div>
                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-navy-50/60 p-4">
                    <ShieldQuestion size={18} className="text-navy-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-navy-700"><strong>Cancellation Policy:</strong> {tour.cancellationPolicy}</p>
                  </div>
                </Reveal>
              )}

              {activeTab === "itinerary" && (
                <Reveal>
                  <div className="relative pl-8">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-navy-200" />
                    {tour.itinerary.map((d, i) => (
                      <div key={i} className="relative pb-8 last:pb-0">
                        <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta-500 text-white text-[11px] font-bold">
                          {d.day}
                        </span>
                        <h4 className="font-display text-base font-semibold text-navy-900">Day {d.day}: {d.title}</h4>
                        <p className="text-sm text-navy-500 mt-1 leading-relaxed">{d.details}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}

              {activeTab === "inclusions" && (
                <Reveal>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-display text-base font-semibold text-navy-900 mb-4">Inclusions</h4>
                      <ul className="space-y-2.5">
                        {tour.inclusions.map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-600">
                            <CheckCircle2 size={16} className="text-forest-500 shrink-0 mt-0.5" /> {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-navy-900 mb-4">Exclusions</h4>
                      <ul className="space-y-2.5">
                        {tour.exclusions.map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-600">
                            <XCircle size={16} className="text-terracotta-400 shrink-0 mt-0.5" /> {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              )}

              {activeTab === "price" && (
                <Reveal>
                  <div className="card-surface p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-navy-100">
                      <span className="text-sm text-navy-500">Per person (twin sharing)</span>
                      <PriceTag original={tour.originalPrice} price={tour.price} size="lg" />
                    </div>
                    <p className="text-sm text-navy-500 mt-4 leading-relaxed">
                      Prices vary by season, group size and hotel category upgrades. Request a personalised quotation for exact dates and traveller count.
                    </p>
                    <p className="text-xs text-navy-400 mt-3">GST and applicable taxes extra, as per government norms.</p>
                  </div>
                </Reveal>
              )}

              {activeTab === "gallery" && (
                <Reveal>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tour.gallery.map((img, i) => (
                      <img key={i} src={img} alt={`${tour.title} gallery ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover rounded-xl" />
                    ))}
                  </div>
                </Reveal>
              )}

              {activeTab === "faqs" && (
                <Reveal>
                  <div className="space-y-3">
                    {tour.faqs.map((f, i) => (
                      <div key={i} className="card-surface p-4">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between text-left">
                          <span className="text-sm font-semibold text-navy-900">{f.q}</span>
                          <ChevronDown size={16} className={`transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                        </button>
                        {openFaq === i && <p className="text-sm text-navy-500 mt-3 leading-relaxed">{f.a}</p>}
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Related packages */}
            <div className="mt-14">
              <SectionHeading eyebrow="You May Also Like" title="Related Packages" />
              <div className="grid sm:grid-cols-3 gap-5">
                {relatedTours.map((t) => (
                  <Link key={t.slug} to={`/tours/${t.slug}`} className="card-surface overflow-hidden group hover:shadow-lift hover:-translate-y-1 transition-all">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={t.image} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-navy-900 line-clamp-2">{t.title}</h4>
                      <p className="text-xs text-navy-400 mt-1">{t.duration}</p>
                      <p className="text-sm font-bold text-navy-900 mt-2">₹{t.price.toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div className="lg:col-span-1">
            <div id="inquiry" className="lg:sticky lg:top-28 space-y-5">
              <div className="card-surface p-6">
                <PriceTag original={tour.originalPrice} price={tour.price} size="lg" />
                <p className="text-xs text-navy-400 mt-1">per person, twin sharing</p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <a href="#inquiry-form" className="btn-primary w-full">Book Now</a>
                  <button onClick={handleDownload} className="btn-secondary w-full">
                    <Download size={16} /> Download Itinerary
                  </button>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest-600 py-3.5 text-sm font-semibold text-forest-700 hover:bg-forest-600 hover:text-white transition-colors">
                    <MessageCircle size={16} /> WhatsApp Inquiry
                  </a>
                </div>
              </div>

              <form id="inquiry-form" onSubmit={handleInquiry} className="card-surface p-6">
                <h4 className="font-display text-lg font-semibold text-navy-900 mb-1">Request a Quotation</h4>
                <p className="text-xs text-navy-400 mb-4">Get a customised quote within 24 hours.</p>
                {submitted ? (
                  <div className="rounded-xl bg-forest-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto text-forest-600 mb-2" size={28} />
                    <p className="text-sm font-semibold text-forest-800">Inquiry received!</p>
                    <p className="text-xs text-forest-600 mt-1">Reference ID: {submitted}</p>
                    <p className="text-xs text-navy-500 mt-2">Our team will reach out shortly.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                    <input required placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                    <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                    <textarea placeholder="Any specific requirements?" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <FileText size={16} /> Send Inquiry
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
