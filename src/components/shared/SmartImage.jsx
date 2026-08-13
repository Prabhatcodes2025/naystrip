import { useEffect, useMemo, useState } from "react";
import { imageCandidates } from "../../data/imageFallbacks";

export default function SmartImage({ src, context = "", fallback, alt = "", className = "", wrapperClassName = "", loading = "lazy", ...props }) {
  const candidates = useMemo(() => imageCandidates(src, context, fallback), [src, context, fallback]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setIndex(0); setLoaded(false); }, [candidates]);
  return <span className={`smart-image ${loaded ? "is-loaded" : ""} ${wrapperClassName}`}>
    <img {...props} src={candidates[index]} alt={alt} loading={loading} className={className} onLoad={() => setLoaded(true)} onError={() => { setLoaded(false); setIndex((value) => Math.min(value + 1, candidates.length - 1)); }} />
  </span>;
}
