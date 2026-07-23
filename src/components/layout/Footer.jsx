import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Mail, MapPin, Instagram, Facebook, Youtube, Twitter, Linkedin,
  Compass, ShieldCheck, CreditCard, Send, CheckCircle2,
} from "lucide-react";
import { getSiteSettings } from "../../data/siteConfig";

export default function Footer() {
  const settings = getSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container-lg pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
                <Compass size={20} />
              </span>
              <span className="font-display text-xl font-bold text-white">{settings.brandName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 max-w-sm">{settings.footerText}</p>
            <div className="mt-5 flex items-center gap-3">
              <a href={settings.social.instagram} aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-gold-400 hover:text-navy-950 transition-colors"><Instagram size={16} /></a>
              <a href={settings.social.facebook} aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-gold-400 hover:text-navy-950 transition-colors"><Facebook size={16} /></a>
              <a href={settings.social.youtube} aria-label="Youtube" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-gold-400 hover:text-navy-950 transition-colors"><Youtube size={16} /></a>
              <a href={settings.social.twitter} aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-gold-400 hover:text-navy-950 transition-colors"><Twitter size={16} /></a>
              <a href={settings.social.linkedin} aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-gold-400 hover:text-navy-950 transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-gold-300 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-gold-300 transition-colors">Careers</Link></li>
              <li><Link to="/corporate-travel" className="hover:text-gold-300 transition-colors">Our Services</Link></li>
              <li><Link to="/blog" className="hover:text-gold-300 transition-colors">Travel Blog</Link></li>
              <li><Link to="/sitemap" className="hover:text-gold-300 transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-gold-300 transition-colors">Help &amp; FAQs</Link></li>
              <li><Link to="/terms" className="hover:text-gold-300 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-gold-300 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5"><Phone size={15} className="mt-0.5 shrink-0 text-gold-300" /> {settings.phone}</li>
              <li className="flex items-start gap-2.5"><Mail size={15} className="mt-0.5 shrink-0 text-gold-300" /> {settings.email}</li>
              <li className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-gold-300" /> {settings.address}</li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 rounded-2xl bg-white/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h4 className="font-display text-lg font-semibold text-white">Get travel inspiration in your inbox</h4>
            <p className="text-sm text-white/50 mt-1">Curated destinations, offers and trip ideas — no spam, ever.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              className="w-full sm:w-64 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold-400 focus:outline-none"
            />
            <button type="submit" aria-label="Subscribe" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-navy-950 hover:bg-gold-300 transition-colors">
              {subscribed ? <CheckCircle2 size={18} /> : <Send size={16} />}
            </button>
          </form>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> IATA Associate Member</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Govt. Recognised Tour Operator</span>
          <span className="flex items-center gap-1.5"><CreditCard size={14} /> Secure Payments — Visa, Mastercard, UPI, Net Banking</span>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gold-300">Terms</Link>
            <Link to="/privacy" className="hover:text-gold-300">Privacy</Link>
            <Link to="/admin/login" className="hover:text-gold-300">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
