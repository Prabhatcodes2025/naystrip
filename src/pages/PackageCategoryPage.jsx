import { useEffect, useMemo, useState } from "react";
import { Navigate, Link, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import Seo from "../components/shared/Seo";
import { PageBanner } from "../components/shared/Bits";
import PackageCard from "../components/tours/PackageCard";
import usePublicPackages from "../hooks/usePublicPackages";
import { tours } from "../data/tours";
import { categoryPages, packageMatchesCategory } from "../data/packageCategories";
import { defaultHeaderMenuOptions, loadSiteSettings } from "../data/siteConfig";

export default function PackageCategoryPage() {
  const { category } = useParams();
  const [menuOptions,setMenuOptions]=useState(defaultHeaderMenuOptions);
  useEffect(()=>{loadSiteSettings().then(settings=>setMenuOptions(settings.headerMenuOptions||[])).catch(()=>{})},[]);
  const option=menuOptions.find(item=>item.slug===category&&item.published!==false);
  const config = categoryPages[category] || (option ? {title:`${option.label} Packages`} : null);
  const { packages } = usePublicPackages();
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const merged = new Map();
    for (const item of [...tours, ...packages]) if (packageMatchesCategory(item, category, option)) merged.set(item.slug, item);
    const term = query.trim().toLowerCase();
    return [...merged.values()].filter((item) => !term || [item.title, item.package_type, item.tripType, ...(item.destination_names || item.destinations || [])].join(" ").toLowerCase().includes(term));
  }, [category, option, packages, query]);
  if (!config) return <Navigate to="/tours/domestic" replace />;
  const hero = items[0]?.hero_image || items[0]?.image || tours[0]?.image;
  return <>
    <Seo title={`${config.title} | NaysTrip & Treks`} description={`Browse published ${config.title.toLowerCase()} and request a tailored itinerary.`}/>
    <PageBanner eyebrow="Tours & packages" title={config.title} subtitle="Browse published journeys, then customise dates, stays and transport with our team." image={hero}/>
    <section className="bg-[#fffdf8] py-12 sm:py-16"><div className="container-lg">
      <label className="relative block max-w-xl"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><span className="sr-only">Search packages</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search title, destination or package type" className="input-field pl-11"/></label>
      {items.length ? <div className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{items.map((item,index)=><PackageCard key={item.slug} tour={item.hero_image?{...item,image:item.hero_image,destinations:item.destination_names||[],duration:`${item.days} Days / ${item.nights} Nights`,price:item.price_from}:item} commercial={item.hero_image?item:packages.find((pkg)=>pkg.slug===item.slug)} priority={index<3}/>)}</div> : <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-display text-3xl text-[#173c34]">No published packages yet</h2><p className="mt-3 text-slate-600">This category is ready for admin-assigned packages. Ask us to plan a custom route meanwhile.</p><Link to="/custom-trip" className="btn-primary mt-6">Plan a custom trip</Link></div>}
    </div></section>
  </>;
}
