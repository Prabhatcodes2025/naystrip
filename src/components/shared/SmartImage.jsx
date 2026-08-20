import { useEffect, useMemo, useRef, useState } from "react";
import { imageCandidates } from "../../data/imageFallbacks";

export default function SmartImage({ src, context = "", fallback, alt = "", className = "", wrapperClassName = "", loading = "lazy", ...props }) {
  const candidates = useMemo(() => imageCandidates(src, context, fallback), [src, context, fallback]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(loading !== "lazy");
  const wrapper = useRef(null);
  useEffect(() => { setIndex(0); setLoaded(false); setFailed(false); }, [candidates]);
  useEffect(() => {
    if (visible || loading !== "lazy") return undefined;
    if (!("IntersectionObserver" in window)) { setVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "240px" });
    if (wrapper.current) observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, [loading, visible]);
  const handleError = () => {
    if (index < candidates.length - 1) { setLoaded(false); setIndex(index + 1); }
    else { setFailed(true); setLoaded(true); }
  };
  return <span ref={wrapper} className={`smart-image ${visible ? "is-visible" : ""} ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""} ${wrapperClassName}`}>
    <img {...props} src={candidates[index]} alt={alt} loading={loading} className={className} onLoad={() => { setLoaded(true); setFailed(false); }} onError={handleError} />
  </span>;
}
