import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Mountain, Gauge, Navigation, Clock, ShieldCheck, Package, CheckCircle2, XCircle, ChevronDown, MessageCircle } from "lucide-react";
import { getTrekBySlug } from "../data/treksExpeditions";
import { PageBanner, PriceTag } from "../components/shared/Bits";
import Reveal from "../components/shared/Reveal";
import Seo from "../components/shared/Seo";
import SmartImage from "../components/shared/SmartImage";
import { saveContactLead } from "../utils/storage";
import { whatsappHref } from "../data/siteConfig";

const stats = (t) => [
  { icon: Gauge, label: "Difficulty", value: t.difficulty },
  { icon: ShieldCheck, label: "Fitness Level", value: t.fitnessLevel },
  { icon: Mountain, label: "Max Altitude", value: t.maxAltitude },
  { icon: Navigation, label: "Best Season", value: t.bestSeason },
  { icon: Clock, label: "Duration", value: t.duration },
];

export default function TrekDetail() {
  const { slug } = useParams();
  const trek = getTrekBySlug(slug);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(null);

  if (!trek) return <Navigate to="/treks" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const entry = await saveContactLead({ ...form, destination: trek.name, source: `${trek.category}: ${trek.name}` });
    setSubmitted(entry.id);
    setForm({ name: "", phone: "", email: "" });
  };

  return (
    <>
      <Seo title={`${trek.name} ${trek.category} | NaysTrip & Treks`} description={trek.overview} />
      <PageBanner eyebrow={trek.category} title={trek.name} subtitle={trek.overview} image={trek.image} />

      <section className="py-10 sm:py-14">
        <div className="container-lg grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Stat strip */}
            <Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
                {stats(trek).map((s) => (
                  <div key={s.label} className="card-surface p-3.5 text-center">
                    <s.icon size={18} className="mx-auto text-terracotta-500 mb-1.5" />
                    <p className="text-[10px] text-navy-400">{s.label}</p>
                    <p className="text-xs font-semibold text-navy-800 mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Detailed Itinerary</h2>
              <div className="relative pl-8">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-navy-200" />
                {trek.itinerary.map((d, i) => (
                  <div key={i} className="relative pb-7 last:pb-0">
                    <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta-500 text-white text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <h4 className="font-display text-base font-semibold text-navy-900">Day {d.day}: {d.title}</h4>
                    <p className="text-sm text-navy-500 mt-1 leading-relaxed">{d.details}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10 grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-forest-600" /> Gear Checklist
                  </h3>
                  <ul className="space-y-2">
                    {trek.gearChecklist.map((g, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-navy-600">
                        <CheckCircle2 size={15} className="text-forest-500 shrink-0" /> {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-navy-600" /> Safety Information
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{trek.safetyInfo}</p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10 grid sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-navy-900 mb-3">Inclusions</h4>
                  <ul className="space-y-2">
                    {trek.inclusions.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-600">
                        <CheckCircle2 size={15} className="text-forest-500 shrink-0 mt-0.5" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-3">Exclusions</h4>
                  <ul className="space-y-2">
                    {trek.exclusions.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-600">
                        <XCircle size={15} className="text-terracotta-400 shrink-0 mt-0.5" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10">
                <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trek.gallery.map((img, i) => (
                    <SmartImage key={i} src={img} context={`${trek.name} trek`} alt={`${trek.name} view ${i + 1}`} loading="lazy" wrapperClassName="aspect-square rounded-xl" className="object-cover" />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10">
                <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">FAQs</h3>
                <div className="space-y-3">
                  {trek.faqs.map((f, i) => (
                    <div key={i} className="card-surface p-4">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between text-left">
                        <span className="text-sm font-semibold text-navy-900">{f.q}</span>
                        <ChevronDown size={16} className={`transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && <p className="text-sm text-navy-500 mt-3 leading-relaxed">{f.a}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <div className="card-surface p-6">
                <PriceTag price={trek.price} size="lg" />
                <p className="text-xs text-navy-400 mt-1">per person</p>
                {submitted ? (
                  <div className="rounded-xl bg-forest-50 p-4 text-center mt-5">
                    <CheckCircle2 className="mx-auto text-forest-600 mb-2" size={26} />
                    <p className="text-sm font-semibold text-forest-800">Inquiry received!</p>
                    <p className="text-xs text-forest-600 mt-1">Reference ID: {submitted}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                    <input required placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                    <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                    <button type="submit" className="btn-primary w-full">Book This {trek.category}</button>
                  </form>
                )}
                <a
                  href={whatsappHref(`Hi NaysTrip! I'm interested in the ${trek.name} ${trek.category}.`)}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest-600 py-3.5 mt-3 text-sm font-semibold text-forest-700 hover:bg-forest-600 hover:text-white transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
