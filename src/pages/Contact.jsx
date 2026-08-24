import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle2, Send } from "lucide-react";
import { PageBanner } from "../components/shared/Bits";
import Seo from "../components/shared/Seo";
import { saveContactLead } from "../utils/storage";
import { getSiteSettings, loadSiteSettings } from "../data/siteConfig";

export default function Contact() {
  const [settings,setSettings]=useState(getSiteSettings());
  const [form, setForm] = useState({ name: "", phone: "", email: "", destination: "", message: "" });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  useEffect(()=>{loadSiteSettings().then(setSettings).catch(()=>{})},[]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.name.trim()) e2.name = "Required";
    if (!form.phone.trim()) e2.phone = "Required";
    if (!form.email.trim()) e2.email = "Required";
    if (!form.message.trim()) e2.message = "Required";
    setErrors(e2);
    if (Object.keys(e2).length) return;
    try { const entry = await saveContactLead(form); setResult(entry.id); setForm({ name: "", phone: "", email: "", destination: "", message: "" }); }
    catch (error) { setErrors({ submit: error.message }); }
  };

  const waLink = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I have a question about planning a trip.")}`;

  return (
    <>
      <Seo title="Contact Us | NaysTrip & Treks" description="Contact our Navi Mumbai travel team for personalised trip planning and support." />
      <PageBanner
        eyebrow="We'd Love to Hear From You"
        title="Contact Us"
        subtitle="Questions, custom requests or just starting to plan — send the team the details you have."
        image="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-12 sm:py-16">
        <div className="container-lg grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div className="card-surface p-6 space-y-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600"><Phone size={18} /></span>
                <div>
                  <p className="text-xs text-navy-400">Call Us</p>
                  <p className="text-sm font-semibold text-navy-800">{settings.phone}</p>
                  <p className="text-xs text-navy-400">Customer care: {settings.supportPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600"><Mail size={18} /></span>
                <div><p className="text-xs text-navy-400">Email Us</p><p className="text-sm font-semibold text-navy-800">{settings.email}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600"><MapPin size={18} /></span>
                <div><p className="text-xs text-navy-400">Office Address</p><p className="text-sm font-semibold text-navy-800">{settings.address}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600"><Clock size={18} /></span>
                <div><p className="text-xs text-navy-400">Business Hours</p><p className="text-sm font-semibold text-navy-800">{settings.businessHours}</p></div>
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest-600 py-3.5 text-sm font-semibold text-forest-700 hover:bg-forest-600 hover:text-white transition-colors">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>

            {settings.address&&<div className="card-surface overflow-hidden"><iframe title="NaysTrip office location" src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`} className="aspect-[4/3] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 text-sm font-semibold text-navy-700"><MapPin size={17} className="text-terracotta-500"/>Open verified office location</a></div>}
          </div>

          <div className="lg:col-span-3">
            <div className="card-surface p-6 sm:p-10">
              {result ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={40} className="mx-auto text-forest-600 mb-4" />
                  <h3 className="font-display text-2xl font-semibold text-navy-900">Request received</h3>
                  <p className="text-navy-500 mt-2">Your contact enquiry has been saved for our team.</p>
                  <div className="mt-5 inline-block rounded-xl bg-navy-50 px-6 py-3">
                    <p className="text-xs text-navy-400">Reference ID</p>
                    <p className="font-display font-bold text-navy-900">{result}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-semibold text-navy-900 mb-1">Send Us a Message</h2>
                  <p className="text-sm text-navy-500 mb-6">Fill out the form and our travel experts will reach out shortly.</p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="label-field">Full Name</label>
                      <input id="contact-name" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field" />
                      {errors.name && <p className="text-xs text-terracotta-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="label-field">Phone Number</label>
                      <input id="contact-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" />
                      {errors.phone && <p className="text-xs text-terracotta-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="label-field">Email Address</label>
                      <input id="contact-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field" />
                      {errors.email && <p className="text-xs text-terracotta-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-destination" className="label-field">Destination (optional)</label>
                      <input id="contact-destination" value={form.destination} onChange={(e) => update("destination", e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="label-field">Message</label>
                    <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} className="input-field resize-none" placeholder="Tell us about the trip you have in mind..." />
                    {errors.message && <p className="text-xs text-terracotta-500 mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    <Send size={16} /> Send Message
                  </button>
                  {errors.submit && <p role="alert" className="text-sm text-terracotta-600">{errors.submit}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
