import { PageBanner } from "../components/shared/Bits";
import Seo from "../components/shared/Seo";
import { Link } from "react-router-dom";
import { getSiteSettings } from "../data/siteConfig";

const pageContent = {
  about: {
    title: "About Us",
    body: [
      "Altiora Journeys was founded with a simple belief: travel planning should feel exciting, not exhausting. What began as a small team of destination specialists has grown into a full-service travel company trusted by thousands of travellers across India.",
      "We combine real, on-ground expertise with transparent pricing and genuine 24/7 support — whether you're booking a weekend escape or a two-week international holiday.",
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
      "By booking a trip with Altiora Journeys, you agree to our booking, payment and cancellation terms as communicated at the time of confirmation. All package prices are subject to availability and may vary based on season, group size and current exchange rates for international trips.",
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
      "How do I book a trip? — Browse our packages or use the Custom Trip planner, then submit an inquiry. Our team will confirm details and share a payment link.",
      "Can I customise a package? — Yes, nearly every itinerary can be adjusted for dates, hotel category, and add-on experiences.",
      "What is your cancellation policy? — Cancellation terms vary by package and are shared clearly at the time of booking confirmation.",
      "Do you assist with visas? — Yes, for applicable international packages our team guides you through the visa process.",
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
  const content = pageContent[slug];
  const settings = getSiteSettings();
  if (!content) return null;

  return (
    <>
      <Seo title={`${content.title} | ${settings.brandName}`} />
      <PageBanner
        eyebrow="Altiora Journeys"
        title={content.title}
        image="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1600&q=80"
      />
      <section className="py-14 sm:py-20">
        <div className="container-lg max-w-3xl">
          {content.links ? (
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
      </section>
    </>
  );
}
