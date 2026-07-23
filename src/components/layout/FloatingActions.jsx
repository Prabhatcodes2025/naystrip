import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, ArrowUp, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getSiteSettings } from "../../data/siteConfig";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const settings = getSiteSettings();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi! I'd like to know more about your travel packages."
  )}`;

  return (
    <>
      {/* Desktop floating stack */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3">
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-lift hover:bg-navy-800 transition-colors"
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift hover:scale-105 transition-transform"
        >
          <MessageCircle size={22} />
        </a>
        <a
          href={`tel:${settings.phone}`}
          aria-label="Call us"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-lift hover:scale-105 transition-transform"
        >
          <Phone size={20} />
        </a>
      </div>

      {/* Mobile bottom action bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur-md px-3 py-2.5 flex items-center justify-between gap-2">
        <a href={`tel:${settings.phone}`} className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-navy-700">
          <Phone size={18} />
          <span className="text-[11px] font-semibold">Call</span>
        </a>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-forest-600">
          <MessageCircle size={18} />
          <span className="text-[11px] font-semibold">WhatsApp</span>
        </a>
        <Link to="/custom-trip" className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-terracotta-500 py-1.5 text-white">
          <Sparkles size={18} />
          <span className="text-[11px] font-semibold">Get Quote</span>
        </Link>
      </div>
    </>
  );
}
