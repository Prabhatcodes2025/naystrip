import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, MessageCircle, Plus, Search, Trash2, X } from "lucide-react";
import MediaUploader from "../../components/admin/MediaUploader";
import { TableSkeleton } from "../../components/shared/Loading";
const empty = {
  title: "",
  slug: "",
  packageType: "tour",
  destinations: [],
  days: 3,
  nights: 2,
  overview: "",
  shortDescription: "",
  route: "",
  highlights: [],
  startPoint: "",
  endPoint: "",
  heroImage: "",
  gallery: [],
  priceFrom: "",
  taxPercent: 5,
  advancePercent: 50,
  bookingMode: "enquiry_only",
  featured: false,
  status: "draft",
  itinerary: [
    {
      title: "Arrival",
      description: "",
      meals: "",
      stay: "",
      transfers: "",
      activities: [],
    },
  ],
  inclusions: [],
  exclusions: [],
  notes: [],
  faqs: [],
  policies: {},
  seo: {},
};
const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("naystrip_admin_session")}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};
const split = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
const slugify=(value)=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const LEH_ADVISORY=`High-altitude preparation
• Keep the first day light and allow time to acclimatise before exertion.
• Stay well hydrated; cold weather can make dehydration less noticeable.
• Avoid alcohol and smoking while acclimatising.
• Dress in layers: thermals, fleece and an insulated outer layer.
• Carry sun protection, prescribed personal medicines, cash and essential supplies.

Connectivity
Postpaid mobile connections are generally more reliable in Ladakh. Coverage is strongest around Leh and major towns and may be unavailable in remote areas. Inform family before travel and carry a power bank.`;
export default function AdminTours() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [readiness, setReadiness] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [slugTouched,setSlugTouched]=useState(false);
  const [notice,setNotice]=useState("");
  const load = async () => {
    setBusy(true);
    try {
      setPackages((await request("/api/admin/packages")).packages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const edit = (item) => {
    setSlugTouched(true);
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      packageType: item.package_type,
      destinations: item.destination_names || [],
      days: item.days,
      nights: item.nights,
      overview: item.overview || "",
      shortDescription: item.short_description || "",
      route: item.route || "",
      highlights: item.highlights || [],
      startPoint: item.start_point || "",
      endPoint: item.end_point || "",
      heroImage: item.hero_image || "",
      gallery: item.gallery || [],
      priceFrom: item.price_from ?? "",
      taxPercent: item.tax_percent || 0,
      advancePercent: item.advance_percent || 50,
      bookingMode:
        item.policies?.booking_mode ||
        (item.booking_enabled && !item.custom_enquiry_only
          ? "flexible_date"
          : "enquiry_only"),
      featured: item.featured,
      status: item.status,
      itinerary: (item.itinerary || [])
        .sort((a, b) => a.day_number - b.day_number)
        .map((day) => ({
          title: day.title,
          description: day.description,
          meals: day.meals || "",
          stay: day.stay || "",
          transfers: day.transfers || "",
          activities: day.activities || [],
        })),
      inclusions: (item.items || [])
        .filter((x) => x.item_type === "inclusion")
        .map((x) => x.body),
      exclusions: (item.items || [])
        .filter((x) => x.item_type === "exclusion")
        .map((x) => x.body),
      notes: (item.items || [])
        .filter((x) => x.item_type === "note")
        .map((x) => x.body),
      faqs: (item.items || [])
        .filter((x) => x.item_type === "faq")
        .map((x) => x.body),
      policies: item.policies || {},
      seo: item.seo || {},
    });
    setOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/admin/packages", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const archive = async (id) => {
    if (
      !confirm(
        "Archive this package? Existing booking records will be preserved.",
      )
    )
      return;
    await request(`/api/admin/packages?id=${id}`, { method: "DELETE" });
    await load();
  };
  const clone = async (id) => {
    await request("/api/admin/packages", {
      method: "POST",
      body: JSON.stringify({ action: "clone", id }),
    });
    await load();
  };
  const publicUrl=(item)=>`${window.location.origin}/trips/${item.slug}`;
  const shareMessage=(item)=>{const departure=(item.departures||[]).filter((entry)=>entry.status!=="cancelled").sort((a,b)=>String(a.start_date).localeCompare(String(b.start_date)))[0];const date=departure?.start_date?new Date(`${departure.start_date}T00:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}).toUpperCase():"DATES ON REQUEST";const highlights=(item.highlights||[]).slice(0,5).map((value)=>`✨ ${value}`).join("\n");return `🌍 ${item.title.toUpperCase()}\n\n📅 ${date}\n⏱️ ${item.days} DAYS / ${item.nights} NIGHTS\n${highlights?`${highlights}\n`:""}${item.price_from!=null?`💰 FROM ₹${Number(item.price_from).toLocaleString("en-IN")}\n`:"💬 PRICE ON REQUEST\n"}\n⚡ Limited availability\n\n🔗 ${publicUrl(item)}\n\n📞 Bookings & Queries\n+91 8097132424`;};
  const copyText=async(value,label)=>{await navigator.clipboard.writeText(value);setNotice(`${label} copied`);window.setTimeout(()=>setNotice(""),2200)};
  const readinessCode = (item) => {
    if (item.price_from == null) return "price_missing";
    if (!item.booking_enabled || item.custom_enquiry_only || item.policies?.booking_mode === "enquiry_only") return "enquiry_only";
    return "online_ready";
  };
  const filtered = useMemo(
    () => packages.filter((item) =>
        (readiness === "all" || readinessCode(item) === readiness) && `${item.title} ${(item.destination_names || []).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())),
    [packages, search, readiness],
  );
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Package Management</h1>
          <p className="text-sm text-navy-500">
            Database-backed catalogue, itinerary and booking rules.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(empty);
            setSlugTouched(false);
            setOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={15} />
          Add package
        </button>
      </div>
      {error && <p className="mt-4 bg-rose-50 p-3 text-sm">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{notice}</p>}
      <div className="mt-5 flex flex-wrap gap-3"><label className="relative block max-w-sm flex-1">
        <Search size={15} className="absolute left-3 top-3.5" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder="Search packages"
        />
      </label><label><span className="sr-only">Filter by booking readiness</span><select value={readiness} onChange={(event) => setReadiness(event.target.value)} className="input-field min-w-56"><option value="all">All readiness states</option><option value="price_missing">PRICE MISSING</option><option value="enquiry_only">ENQUIRY ONLY</option><option value="online_ready">ONLINE BOOKING READY</option></select></label></div>
      {busy && !packages.length ? <div className="mt-5"><TableSkeleton /></div> : <div className="mt-5 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[850px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Package</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Price</th>
              <th className="p-4">Booking</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">
                  <strong>{item.title}</strong>
                  <span className="block text-xs text-navy-400">
                    {(item.destination_names || []).join(", ")}
                  </span>
                </td>
                <td className="p-4">
                  {item.days}D / {item.nights}N
                </td>
                <td className="p-4">
                  {item.price_from == null
                    ? "On request"
                    : `INR ${Number(item.price_from).toLocaleString("en-IN")}`}
                </td>
                <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${readinessCode(item) === "online_ready" ? "bg-emerald-50 text-emerald-700" : readinessCode(item) === "price_missing" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{readinessCode(item) === "online_ready" ? "ONLINE BOOKING READY" : readinessCode(item) === "price_missing" ? "PRICE MISSING" : "ENQUIRY ONLY"}</span></td>
                <td className="p-4">{item.status}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => edit(item)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => clone(item.id)}
                      title="Clone"
                      className="grid h-10 w-10 place-items-center bg-navy-50"
                    >
                      <Copy size={15} />
                    </button>
                    <button onClick={()=>copyText(publicUrl(item),"Trip URL")} title="Copy public trip URL" className="grid h-10 w-10 place-items-center bg-emerald-50 text-emerald-700"><ExternalLink size={15}/></button>
                    <button onClick={()=>copyText(shareMessage(item),"Share message")} title="Generate and copy share message" className="grid h-10 w-10 place-items-center bg-sky-50 text-sky-700"><MessageCircle size={15}/></button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage(item))}`} target="_blank" rel="noopener noreferrer" title="Open WhatsApp" className="grid h-10 w-10 place-items-center bg-green-50 text-green-700"><MessageCircle size={15}/></a>
                    <a href={`/api/documents/itinerary?slug=${encodeURIComponent(item.slug)}`} title="Download itinerary PDF" className="grid h-10 w-10 place-items-center bg-orange-50 text-orange-700"><Download size={15}/></a>
                    <button
                      onClick={() => archive(item.id)}
                      title="Archive"
                      className="grid h-10 w-10 place-items-center bg-rose-50 text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            className="absolute inset-0 bg-navy-950/70"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <section className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5"
            >
              <X />
            </button>
            <h2 className="font-display text-3xl">
              {form.id ? "Edit" : "Create"} package
            </h2>
            <form onSubmit={save} className="mt-6 space-y-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Title", "title"],
                  ["Slug", "slug"],
                  ["Route", "route"],
                  ["Start point", "startPoint"],
                  ["End point", "endPoint"],
                ].map(([label, key]) => (
                  <label key={key}>
                    <span className="label-field">{label}</span>
                    <input
                      required={["title", "slug"].includes(key)}
                      value={form[key]}
                      onChange={(e) => {const value=e.target.value;if(key==="slug")setSlugTouched(true);setForm({ ...form, [key]: value, ...(key==="title"&&!slugTouched?{slug:slugify(value)}:{}) });}}
                      className="input-field"
                    />
                  </label>
                ))}
                <label>
                  <span className="label-field">
                    Destinations, one per line
                  </span>
                  <textarea
                    value={form.destinations.join("\n")}
                    onChange={(e) =>
                      setForm({ ...form, destinations: split(e.target.value) })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Days</span>
                  <input
                    type="number"
                    min="1"
                    value={form.days}
                    onChange={(e) =>
                      setForm({ ...form, days: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Nights</span>
                  <input
                    type="number"
                    min="0"
                    value={form.nights}
                    onChange={(e) =>
                      setForm({ ...form, nights: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Price from</span>
                  <input
                    type="number"
                    min="0"
                    value={form.priceFrom}
                    onChange={(e) =>
                      setForm({ ...form, priceFrom: e.target.value })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Tax %</span>
                  <input
                    type="number"
                    value={form.taxPercent}
                    onChange={(e) =>
                      setForm({ ...form, taxPercent: e.target.value })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Advance %</span>
                  <input
                    type="number"
                    value={form.advancePercent}
                    onChange={(e) =>
                      setForm({ ...form, advancePercent: e.target.value })
                    }
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-field">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="input-field"
                  >
                    <option>draft</option>
                    <option>published</option>
                    <option>archived</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <MediaUploader label="Hero / cover image" value={form.heroImage} onChange={(heroImage) => setForm({ ...form, heroImage })} scope={`packages/${form.id || form.slug || "draft"}/hero`} context={`${form.title} ${form.destinations.join(" ")}`} />
                <div><label className="label-field">Image alt text</label><input value={form.seo?.hero_alt || ""} onChange={(event) => setForm({ ...form, seo: { ...form.seo, hero_alt: event.target.value } })} className="input-field" placeholder="Describe the destination shown"/><details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-bold">Use an existing image URL</summary><input value={form.heroImage} onChange={(event) => setForm({ ...form, heroImage: event.target.value })} className="input-field mt-2" placeholder="https://…"/></details></div>
              </div>
              <MediaUploader multiple label="Package gallery" value={form.gallery} onChange={(gallery) => setForm({ ...form, gallery })} scope={`packages/${form.id || form.slug || "draft"}/gallery`} context={`${form.title} ${form.destinations.join(" ")}`} />
              <label>
                <span className="label-field">Overview</span>
                <textarea
                  rows="4"
                  value={form.overview}
                  onChange={(e) =>
                    setForm({ ...form, overview: e.target.value })
                  }
                  className="input-field"
                />
              </label>
              <div className="grid gap-4 lg:grid-cols-2"><label><span className="label-field">Short marketing description</span><textarea rows="3" value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} className="input-field" maxLength="500"/></label><label><span className="label-field">Highlights, one per line</span><textarea rows="3" value={form.highlights.join("\n")} onChange={(e)=>setForm({...form,highlights:split(e.target.value)})} className="input-field"/></label></div>
              <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="font-bold text-[#173c34]">Travel advisory / important information</h3><p className="mt-1 text-xs text-slate-500">Attach only when relevant. This appears on the trip page and in its PDF.</p></div><select aria-label="Advisory preset" value="" onChange={(e)=>{if(e.target.value==="leh")setForm({...form,policies:{...form.policies,travel_advisory:LEH_ADVISORY}})}} className="input-field max-w-xs"><option value="">Choose a preset…</option><option value="leh">Leh / Ladakh high altitude</option></select></div><textarea rows="8" value={form.policies?.travel_advisory||""} onChange={(e)=>setForm({...form,policies:{...form.policies,travel_advisory:e.target.value}})} className="input-field mt-4" placeholder="Destination-specific advice, packing, connectivity and preparation guidance"/></section>
              <div className="flex flex-wrap gap-6">
                <label>
                  <span className="label-field">Booking mode</span>
                  <select
                    value={form.bookingMode}
                    onChange={(e) =>
                      setForm({ ...form, bookingMode: e.target.value })
                    }
                    className="input-field min-w-64"
                  >
                    <option value="enquiry_only">Enquiry / quote only</option>
                    <option value="flexible_date">Online booking — customer selects date</option>
                    <option value="fixed_departure">Online booking — fixed departures only</option>
                  </select>
                  <span className="mt-1 block max-w-md text-xs text-navy-400">
                    Flexible-date booking requires an approved “Price from”. Fixed-departure booking requires a live departure with capacity and either a departure price or package price.
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />{" "}
                  Featured
                </label>
              </div>
              <section>
                <div className="flex justify-between">
                  <h3 className="font-bold">Itinerary builder</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        itinerary: [
                          ...form.itinerary,
                          {
                            title: "",
                            description: "",
                            meals: "",
                            stay: "",
                            transfers: "",
                            activities: [],
                          },
                        ],
                      })
                    }
                    className="btn-secondary"
                  >
                    <Plus size={14} />
                    Add day
                  </button>
                </div>
                <div className="mt-3 space-y-4">
                  {form.itinerary.map((day, index) => (
                    <fieldset key={index} className="border p-4">
                      <legend className="px-2 font-bold">
                        Day {index + 1}
                      </legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          placeholder="Title"
                          value={day.title}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              itinerary: form.itinerary.map((item, i) =>
                                i === index
                                  ? { ...item, title: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="input-field"
                        />
                        <input
                          placeholder="Stay"
                          value={day.stay}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              itinerary: form.itinerary.map((item, i) =>
                                i === index
                                  ? { ...item, stay: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="input-field"
                        />
                        <textarea
                          placeholder="Description"
                          value={day.description}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              itinerary: form.itinerary.map((item, i) =>
                                i === index
                                  ? { ...item, description: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="input-field sm:col-span-2"
                        />
                        <input
                          placeholder="Meals"
                          value={day.meals}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              itinerary: form.itinerary.map((item, i) =>
                                i === index
                                  ? { ...item, meals: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="input-field"
                        />
                        <input
                          placeholder="Transfers"
                          value={day.transfers}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              itinerary: form.itinerary.map((item, i) =>
                                i === index
                                  ? { ...item, transfers: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            itinerary: form.itinerary.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        className="mt-2 text-sm font-bold text-rose-600"
                      >
                        Delete day
                      </button>
                    </fieldset>
                  ))}
                </div>
              </section>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Inclusions", "inclusions"],
                  ["Exclusions", "exclusions"],
                  ["Notes", "notes"],
                  ["FAQs", "faqs"],
                ].map(([label, key]) => (
                  <label key={key}>
                    <span className="label-field">{label}, one per line</span>
                    <textarea
                      rows="5"
                      value={form[key].join("\n")}
                      onChange={(e) =>
                        setForm({ ...form, [key]: split(e.target.value) })
                      }
                      className="input-field"
                    />
                  </label>
                ))}
              </div>
              <button disabled={busy} className="btn-primary">
                {busy ? "Saving…" : "Save package"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
