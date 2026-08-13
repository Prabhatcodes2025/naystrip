const assets = {
  full: "/branding/naystrip-logo-transparent.png",
  master: "/branding/naystrip-logo.png",
  symbol: "/branding/naystrip-symbol.png",
};

export default function BrandLogo({ variant = "full", className = "", eager = false, animated = false }) {
  return (
    <img
      src={assets[variant] || assets.full}
      alt="NaysTrip – Leisure to Adventure"
      className={`block object-contain ${animated ? "brand-logo-reveal" : ""} ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
