import { PageBanner } from "../components/shared/Bits";
import Seo from "../components/shared/Seo";
import { Link } from "react-router-dom";
import { Compass, Headphones, Map, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteSettings, loadSiteSettings } from "../data/siteConfig";
import { policyPages } from "../data/policies";

const pageContent = {
  about: {
    title: "About Us",
    body: [
      "NaysTrip & Treks is a Mumbai and Navi Mumbai-based travel and adventure company specialising in group travel, tailor-made itineraries, mountain trekking, educational travel and corporate journeys.",
      "We combine practical, on-ground expertise with transparent pricing and dedicated support — whether you're booking a weekend escape or a longer international holiday.",
      "Every itinerary we create is reviewed by someone who has either travelled the route themselves or worked closely with verified local partners, so you always know exactly what to expect.",
    ],
  },
  careers: {
    title: "Careers",
    body: [
      "We're always looking for people who genuinely love travel and care about getting the details right. Our team includes destination specialists, travel consultants, operations experts and customer support professionals working from our Bengaluru office.",
      "If you're interested in joining us, write to us with your resume and a short note about your favourite trip so far.",
    ],
  },
  terms: {
    title: "Terms and Conditions",
    body: [
      "By booking with NaysTrip & Treks, you agree to the booking, payment and cancellation terms issued with your quotation. Package prices remain subject to availability, season, group size and current supplier charges.",
      "Full payment terms, applicable cancellation charges and rescheduling policies are shared in your personalised quotation before booking confirmation.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only the information necessary to plan and manage your trip — including your name, contact details and travel preferences. This information is never sold to third parties and is used solely to deliver our travel services and occasional relevant updates, which you can opt out of at any time.",
      "Payment information is processed through secure, industry-standard encrypted channels and is not stored on our servers.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    body: [
      "All itineraries, prices and travel information on this website are indicative and subject to change based on availability, seasonality and local conditions. Images used are for illustrative purposes and may not represent the exact accommodation or experience booked.",
      "Weather-dependent activities such as high-altitude passes, water sports and trekking routes may be modified or cancelled by local authorities for safety reasons.",
    ],
  },
  faqs: {
    title: "Help & FAQs",
    body: [
      "How do I book a trip? — Browse a package or use the Custom Trip planner. After details and availability are confirmed, you receive a written quotation or secure checkout option.",
      "Can I customise a package? — Yes. Dates, pace, stay category, transport and optional services can be adjusted before confirmation.",
      "How much advance is required? — The exact advance is shown in your quotation or checkout before payment; it can vary by package and supplier terms.",
      "How are payments confirmed? — A payment is confirmed only after server-side gateway verification. Your account then shows the booking and available documents.",
      "What is your cancellation and refund process? — Use the registered account or email with your booking reference. Applicable charges follow the published policy and any stricter supplier terms disclosed before booking.",
      "Which traveller documents are needed? — Requirements depend on the destination and service. The final itinerary or booking communication lists the documents needed for your trip.",
      "Where can I get support? — Use the Contact page, call +91 8097132424, or use the WhatsApp control. Keep your enquiry or booking reference ready.",
      "How do B2B partner accounts work? — Register with valid business details and PAN. Private partner access remains unavailable until an authorised admin approves the application.",
    ],
  },
  sitemap: {
    title: "Sitemap",
    links: [
      ["Home", "/"], ["All Tours", "/tours"], ["Destinations", "/destinations"], ["Holidays", "/holidays"],
      ["Fixed Departures", "/fixed-departures"], ["Treks", "/treks"], ["Expeditions", "/expeditions"],
      ["Transport", "/transport"], ["Custom Trip", "/custom-trip"], ["Corporate Travel", "/corporate-travel"],
      ["How It Works", "/how-it-works"], ["Blog", "/blog"], ["Contact Us", "/contact"],
      ["About Us", "/about"], ["Careers", "/careers"], ["Terms & Conditions", "/terms"],
      ["Privacy Policy", "/privacy"], ["Disclaimer", "/disclaimer"], ["Help & FAQs", "/faqs"],
    ],
  },
};

export default function StaticPage({ slug }) {
  const content = policyPages[slug] || pageContent[slug];
  const [settings,setSettings]=useState(getSiteSettings());
  useEffect(()=>{loadSiteSettings().then(setSettings).catch(()=>{})},[]);
  if (!content) return null;

  return (
    <>
      <Seo title={`${content.title} | ${settings.brandName}`} />
      <PageBanner
        eyebrow="NaysTrip & Treks"
        title={content.title}
        image="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1600&q=80"
      />
      {slug === "about" ? <AboutContent body={content.body} settings={settings} /> : <section className="py-14 sm:py-20">
        <div className="container-lg max-w-3xl">
          {content.sections ? (
            <article>
              <p className="text-lg leading-8 text-slate-600">{content.intro}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[.12em] text-slate-400">Last updated {content.updated}</p>
              <div className="mt-10 space-y-10">
                {content.sections.map(([heading, paragraphs]) => <section key={heading}>
                  <h2 className="font-display text-3xl text-[#173c34]">{heading}</h2>
                  <div className="mt-4 space-y-3">{paragraphs.map((paragraph) => <p key={paragraph} className="leading-7 text-slate-600">{paragraph}</p>)}</div>
                </section>)}
              </div>
            </article>
          ) : content.links ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {content.links.map(([label, to]) => (
                <Link key={to} to={to} className="card-surface px-5 py-4 text-sm font-semibold text-navy-700 hover:text-terracotta-600 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="prose-none space-y-5">
              {content.body.map((p, i) => (
                <p key={i} className="text-navy-600 leading-relaxed">{p}</p>
              ))}
            </div>
          )}
        </div>
      </section>}
    </>
  );
}

function AboutContent({ body, settings }) {
  const cards = [
    [Compass, "Who we are", body[0]],
    [Map, "What we do", "Tour packages, tailor-made holidays, treks, educational travel and corporate journeys—from leisure to adventure."],
    [ShieldCheck, "How we plan trips", "We review routes with experienced travellers and verified local partners, then make inclusions, pricing and next steps easy to understand."],
    [Headphones, "Why NaysTrip", "Practical on-ground knowledge, transparent communication and genuine support before, during and after your journey."],
  ];
  const team=(settings.team||[]).filter((member)=>member.published&&member.name);
  const initiative=settings.socialInitiative?.published&&settings.socialInitiative.title?settings.socialInitiative:null;
  return <>
    <section className="py-14 sm:py-20"><div className="container-lg"><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="eyebrow">Travel planned by people</p><h2 className="section-title mt-3">Clear routes. Human support. Better journeys.</h2></div><p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{body[1]}</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2">{cards.map(([Icon,title,copy])=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(19,52,45,.06)] sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-orange-600"><Icon size={22}/></span><h3 className="mt-6 font-display text-2xl text-[#173c34]">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p></article>)}</div></div></section>
    {team.length>0&&<section className="bg-[#fffaf2] py-14 sm:py-20"><div className="container-lg"><p className="eyebrow">Team</p><h2 className="section-title mt-3">The people behind the journeys.</h2><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{team.map((member)=><article key={member.name} className="overflow-hidden rounded-2xl border bg-white">{member.photo&&<img src={member.photo} alt={member.name} className="aspect-[4/3] max-h-72 w-full object-cover" loading="lazy"/>}<div className="p-6"><h3 className="font-display text-2xl text-[#173c34]">{member.name}</h3><p className="mt-1 text-xs font-bold uppercase tracking-wide text-orange-600">{member.role}</p>{member.bio&&<p className="mt-3 text-sm leading-6 text-slate-600">{member.bio}</p>}</div></article>)}</div></div></section>}
    {initiative&&<section className="py-14 sm:py-20"><div className="container-lg grid gap-7 lg:grid-cols-2 lg:items-center">{initiative.image&&<img src={initiative.image} alt={initiative.title} className="aspect-[16/10] max-h-96 w-full rounded-2xl object-cover" loading="lazy"/>}<div><p className="eyebrow">Social Initiative</p><h2 className="section-title mt-3">{initiative.title}</h2><p className="mt-4 leading-7 text-slate-600">{initiative.description}</p>{initiative.link&&<a href={initiative.link} target="_blank" rel="noreferrer" className="btn-secondary mt-6">Learn more</a>}</div></div></section>}
    <section className="bg-[#fff3df] py-14 sm:py-20"><div className="container-lg flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="eyebrow">Start with an idea</p><h2 className="mt-3 max-w-3xl font-display text-3xl text-[#173c34] sm:text-5xl">Tell us where you want to go. We will shape the route.</h2></div><Link to="/custom-trip" className="btn-primary shrink-0">Plan my trip</Link></div></section>
  </>;
}
