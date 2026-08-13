import { useEffect, useMemo, useState } from "react";

export default function usePublicPackages() {
  const [packages, setPackages] = useState([]);
  useEffect(() => {
    let active = true;
    fetch("/api/packages", { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalogue unavailable")))
      .then((data) => { if (active) setPackages(data.packages || []); })
      .catch(() => { if (active) setPackages([]); });
    return () => { active = false; };
  }, []);
  return useMemo(() => ({
    packages,
    bySlug: new Map(packages.map((item) => [item.slug, item])),
  }), [packages]);
}
