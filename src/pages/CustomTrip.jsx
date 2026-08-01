import { useState } from "react";
import {
  MapPin, Calendar, Moon, Users, Baby, Compass, Wallet, User, Phone, Mail,
  Plane, Hotel, Bus, Car, Ship, Landmark, FileCheck, Shield, CheckCircle2, ArrowRight, ArrowLeft,
} from "lucide-react";
import { PageBanner } from "../components/shared/Bits";
import Seo from "../components/shared/Seo";
import { saveCustomLead } from "../utils/storage";

const serviceOptions = [
  { key: "flights", label: "Flights", icon: Plane },
  { key: "hotels", label: "Hotels", icon: Hotel },
  { key: "busTrain", label: "Bus or Train", icon: Bus },
  { key: "carRental", label: "Car Rental", icon: Car },
  { key: "cruise", label: "Cruise", icon: Ship },
  { key: "sightseeing", label: "Sightseeing", icon: Landmark },
  { key: "visa", label: "Visa", icon: FileCheck },
  { key: "insurance", label: "Travel Insurance", icon: Shield },
];

const initialState = {
  from: "", to: "", departureDate: "", nights: "3", adults: "2", minors: "0",
  tripType: "Adventure", budget: "50000-100000",
  firstName: "", lastName: "", phone: "", email: "", details: "", consent: false,
  services: {},
};

export default function CustomTrip() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));
  const toggleService = (key) => setData((d) => ({ ...d, services: { ...d.services, [key]: !d.services[key] } }));

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!data.from.trim()) e.from = "Required";
      if (!data.to.trim()) e.to = "Required";
      if (!data.departureDate) e.departureDate = "Required";
    }
    if (s === 3) {
      if (!data.firstName.trim()) e.firstName = "Required";
      if (!data.lastName.trim()) e.lastName = "Required";
      if (!data.phone.trim()) e.phone = "Required";
      if (!data.email.trim()) e.email = "Required";
      if (!data.consent) e.consent = "Please accept to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(3, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    try { const entry = await saveCustomLead(data); setResult(entry.id); }
    catch (error) { setErrors({ submit: error.message }); }
  };

  if (result) {
    return (
      <>
        <Seo title="Trip Request Received | NaysTrip & Treks" />
        <section className="min-h-[70vh] flex items-center justify-center py-20">
          <div className="container-lg max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-50 text-forest-600 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="font-display text-3xl font-semibold text-navy-900">Your Trip Request is In!</h1>
            <p className="text-navy-500 mt-3">Our travel experts will reach out with a customised itinerary within 24 hours.</p>
            <div className="mt-6 inline-block rounded-xl bg-navy-50 px-6 py-4">
              <p className="text-xs text-navy-400">Your Inquiry Number</p>
              <p className="font-display text-xl font-bold text-navy-900">{result}</p>
            </div>
            <div className="mt-8">
              <a href="/" className="btn-primary">Back to Home</a>
            </div>
          </div>
        </section>
      </>
    );
  }

  const steps = [
    { n: 1, label: "Destination & Dates" },
    { n: 2, label: "Travellers & Services" },
    { n: 3, label: "Your Details" },
  ];

  return (
    <>
      <Seo title="Plan a Custom Trip | NaysTrip & Treks" description="Build a fully personalised itinerary in three simple steps." />
      <PageBanner
        eyebrow="Tailor-Made"
        title="Plan Your Custom Trip"
        subtitle="Tell us what you have in mind — we'll turn it into a detailed, ready-to-book itinerary."
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="py-10 sm:py-16">
        <div className="container-lg max-w-3xl">
          {/* Progress indicator */}
          <div className="flex items-center mb-12">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      step >= s.n ? "bg-terracotta-500 text-white" : "bg-navy-100 text-navy-400"
                    }`}
                  >
                    {step > s.n ? <CheckCircle2 size={18} /> : s.n}
                  </div>
                  <span className={`mt-2 text-[11px] font-semibold text-center max-w-[90px] ${step >= s.n ? "text-navy-800" : "text-navy-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-6 transition-colors ${step > s.n ? "bg-terracotta-500" : "bg-navy-100"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-10">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">Where would you like to go?</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="trip-from" className="label-field"><MapPin size={14} className="inline mr-1.5 -mt-0.5" />Leaving From</label>
                    <input id="trip-from" value={data.from} onChange={(e) => update("from", e.target.value)} placeholder="e.g. Delhi" className="input-field" />
                    {errors.from && <p className="text-xs text-terracotta-500 mt-1">{errors.from}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-to" className="label-field"><Compass size={14} className="inline mr-1.5 -mt-0.5" />Going To</label>
                    <input id="trip-to" value={data.to} onChange={(e) => update("to", e.target.value)} placeholder="e.g. Leh Ladakh" className="input-field" />
                    {errors.to && <p className="text-xs text-terracotta-500 mt-1">{errors.to}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-date" className="label-field"><Calendar size={14} className="inline mr-1.5 -mt-0.5" />Departure Date</label>
                    <input id="trip-date" type="date" value={data.departureDate} onChange={(e) => update("departureDate", e.target.value)} className="input-field" />
                    {errors.departureDate && <p className="text-xs text-terracotta-500 mt-1">{errors.departureDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-nights" className="label-field"><Moon size={14} className="inline mr-1.5 -mt-0.5" />Number of Nights</label>
                    <input id="trip-nights" type="number" min="1" value={data.nights} onChange={(e) => update("nights", e.target.value)} className="input-field" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">Who's travelling, and what do you need?</h2>
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="label-field"><Users size={14} className="inline mr-1.5 -mt-0.5" />Adults</label>
                    <input type="number" min="1" value={data.adults} onChange={(e) => update("adults", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field"><Baby size={14} className="inline mr-1.5 -mt-0.5" />Minors</label>
                    <input type="number" min="0" value={data.minors} onChange={(e) => update("minors", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field"><Compass size={14} className="inline mr-1.5 -mt-0.5" />Trip Type</label>
                    <select value={data.tripType} onChange={(e) => update("tripType", e.target.value)} className="input-field">
                      <option>Adventure</option><option>Honeymoon</option><option>Family</option><option>Luxury</option><option>Wildlife</option><option>Religious</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-field"><Wallet size={14} className="inline mr-1.5 -mt-0.5" />Budget (per person)</label>
                  <select value={data.budget} onChange={(e) => update("budget", e.target.value)} className="input-field">
                    <option value="under-25000">Under ₹25,000</option>
                    <option value="25000-50000">₹25,000 – ₹50,000</option>
                    <option value="50000-100000">₹50,000 – ₹1,00,000</option>
                    <option value="above-100000">Above ₹1,00,000</option>
                  </select>
                </div>
                <div>
                  <label className="label-field mb-3">Services Needed</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {serviceOptions.map((s) => (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => toggleService(s.key)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 transition-colors ${
                          data.services[s.key] ? "border-terracotta-500 bg-terracotta-50" : "border-navy-100 hover:border-navy-300"
                        }`}
                      >
                        <s.icon size={20} className={data.services[s.key] ? "text-terracotta-600" : "text-navy-400"} />
                        <span className="text-[11px] font-semibold text-navy-700 text-center">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">How can we reach you?</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="trip-first-name" className="label-field"><User size={14} className="inline mr-1.5 -mt-0.5" />First Name</label>
                    <input id="trip-first-name" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} className="input-field" />
                    {errors.firstName && <p className="text-xs text-terracotta-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-last-name" className="label-field">Last Name</label>
                    <input id="trip-last-name" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} className="input-field" />
                    {errors.lastName && <p className="text-xs text-terracotta-500 mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-phone" className="label-field"><Phone size={14} className="inline mr-1.5 -mt-0.5" />Phone</label>
                    <input id="trip-phone" value={data.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" />
                    {errors.phone && <p className="text-xs text-terracotta-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="trip-email" className="label-field"><Mail size={14} className="inline mr-1.5 -mt-0.5" />Email</label>
                    <input id="trip-email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className="input-field" />
                    {errors.email && <p className="text-xs text-terracotta-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="label-field">Additional Details</label>
                  <textarea rows={4} value={data.details} onChange={(e) => update("details", e.target.value)} placeholder="Any specific preferences, occasions or requirements?" className="input-field resize-none" />
                </div>
                <label className="flex items-start gap-2.5 text-xs text-navy-500">
                  <input type="checkbox" checked={data.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-0.5 accent-terracotta-500" />
                  I agree to be contacted by NaysTrip &amp; Treks regarding my trip request via phone, email or WhatsApp.
                </label>
                {errors.consent && <p className="text-xs text-terracotta-500">{errors.consent}</p>}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              {step > 1 ? (
                <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
              ) : <span />}
              {step < 3 ? (
                <button type="button" onClick={next} className="btn-primary">Next <ArrowRight size={16} /></button>
              ) : (
                <button type="submit" className="btn-primary">Submit Trip Request</button>
              )}
            </div>
            {errors.submit && <p role="alert" className="mt-4 text-sm text-terracotta-600">{errors.submit}</p>}
          </form>
        </div>
      </section>
    </>
  );
}
