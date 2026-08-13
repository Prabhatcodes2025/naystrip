import { Star } from "lucide-react";
import Reveal from "./Reveal";
import SmartImage from "./SmartImage";

export function SectionHeading({ eyebrow, title, subtitle, center = false, light = false }) {
  return (
    <div className={`mb-10 sm:mb-14 ${center ? "text-center mx-auto" : ""}`}>
      <Reveal>
        {eyebrow && <span className="eyebrow mb-3 block">{eyebrow}</span>}
        <h2 className={`section-title ${light ? "text-white" : ""} ${center ? "mx-auto" : ""}`}>{title}</h2>
        {subtitle && (
          <p className={`section-subtitle mt-4 ${light ? "text-white/75" : ""} ${center ? "mx-auto" : ""}`}>
            {subtitle}
          </p>
        )}
      </Reveal>
    </div>
  );
}

export function StarRating({ rating, size = 14, showValue = true }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < full
                ? "fill-gold-400 text-gold-400"
                : i === full && hasHalf
                ? "fill-gold-200 text-gold-400"
                : "fill-navy-100 text-navy-200"
            }
          />
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold text-navy-600">{rating.toFixed(1)}</span>}
    </span>
  );
}

export function PriceTag({ original, price, size = "base" }) {
  const cls = size === "lg" ? "text-2xl sm:text-3xl" : "text-lg";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-display font-bold text-navy-900 ${cls}`}>
        ₹{price.toLocaleString("en-IN")}
      </span>
      {original && original > price && (
        <span className="text-sm text-navy-400 line-through">₹{original.toLocaleString("en-IN")}</span>
      )}
    </div>
  );
}

export function PageBanner({ eyebrow, title, subtitle, image }) {
  return (
    <section className="page-hero relative flex items-end overflow-hidden bg-navy-950">
      <SmartImage
        src={image}
        context={title}
        alt={title}
        wrapperClassName="absolute inset-0"
        className="object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-navy-950/20" />
      <div className="container-lg relative z-10 pb-9 sm:pb-12">
        {eyebrow && <span className="eyebrow text-gold-300 mb-2 block">{eyebrow}</span>}
        <h1 className="page-hero__title font-display font-semibold text-white text-shadow-sm">
          {title}
        </h1>
        {subtitle && <p className="text-white/80 mt-3 max-w-2xl text-sm sm:text-base">{subtitle}</p>}
      </div>
    </section>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="text-center py-16">
      <p className="font-display text-xl text-navy-700 mb-2">{title}</p>
      {subtitle && <p className="text-navy-400 text-sm">{subtitle}</p>}
    </div>
  );
}
