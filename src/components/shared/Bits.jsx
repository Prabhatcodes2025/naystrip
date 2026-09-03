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
  const numeric = Number(rating);
  const safeRating = Number.isFinite(numeric) ? Math.min(5, Math.max(0, numeric)) : 0;
  const full = Math.floor(safeRating);
  const hasHalf = safeRating - full >= 0.5;
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
      {showValue && Number.isFinite(numeric) && <span className="text-xs font-semibold text-navy-600">{safeRating.toFixed(1)}</span>}
    </span>
  );
}

export function PriceTag({ original, price, size = "base" }) {
  const cls = size === "lg" ? "text-2xl sm:text-3xl" : "text-lg";
  const numericPrice = Number(price);
  const hasPrice = price !== null && price !== undefined && Number.isFinite(numericPrice) && numericPrice > 0;
  const numericOriginal = Number(original);
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-display font-bold text-navy-900 ${cls}`}>
        {hasPrice ? `₹${numericPrice.toLocaleString("en-IN")}` : "Price on request"}
      </span>
      {hasPrice && Number.isFinite(numericOriginal) && numericOriginal > numericPrice && (
        <span className="text-sm text-navy-400 line-through">₹{numericOriginal.toLocaleString("en-IN")}</span>
      )}
    </div>
  );
}

export function PageBanner({ eyebrow, title, subtitle, image, imageAlt }) {
  return (
    <section className="page-hero relative flex items-end overflow-hidden bg-navy-950">
      <SmartImage
        src={image}
        context={title}
        alt={imageAlt || title}
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
