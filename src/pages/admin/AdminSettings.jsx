import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { defaultSiteSettings, getSiteSettings, loadSiteSettings, saveSiteSettings } from "../../data/siteConfig";
import { tours } from "../../data/tours";
import { treks } from "../../data/treksExpeditions";
import BrandLogo from "../../components/branding/BrandLogo";

export default function AdminSettings() {
  const [form, setForm] = useState(getSiteSettings());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(()=>{loadSiteSettings().then(setForm).catch(()=>{})},[]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateSocial = (field, value) => setForm((f) => ({ ...f, social: { ...f.social, [field]: value } }));
  const toggleSlug = (field, slug) => setForm((current) => ({ ...current, [field]: current[field].includes(slug) ? current[field].filter((item) => item !== slug) : [...current[field], slug] }));
  const updateTrust = (field, value) => setForm((current) => ({ ...current, trustMetrics: { ...current.trustMetrics, [field]: value } }));
  const updateTeam = (index, field, value) => setForm((current) => ({ ...current, team: current.team.map((member, itemIndex) => itemIndex === index ? { ...member, [field]: value } : member) }));
  const updateInitiative = (field, value) => setForm((current) => ({ ...current, socialInitiative: { ...current.socialInitiative, [field]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try { await saveSiteSettings(form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch { setError("Settings were not saved. Check your admin session and database connection."); }
  };

  const handleReset = async () => {
    if (confirm("Reset all settings to default?")) {
      setForm(defaultSiteSettings);
      try { await saveSiteSettings(defaultSiteSettings); } catch { setError("Default settings could not be saved."); }
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Website Settings</h1>
      <p className="text-sm text-navy-500 mt-1 mb-6">Changes here reflect across the public website in real time.</p>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">General</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><span className="label-field">Official brand asset</span><div className="flex min-h-28 items-center bg-[#fffaf2] p-3"><BrandLogo className="h-24 w-auto"/></div><p className="mt-1 text-xs text-navy-400">Locked to the approved NaysTrip master logo.</p></div>
            <div><label className="label-field">Homepage CTA Text</label><input value={form.homepageCtaText} onChange={(e) => update("homepageCtaText", e.target.value)} className="input-field" /></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Contact Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label-field">Phone Number</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Support Phone</label><input value={form.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Email</label><input value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Website URL</label><input type="url" value={form.website||""} onChange={(e) => update("website", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Cancellation Email</label><input type="email" value={form.cancellationEmail} onChange={(e) => update("cancellationEmail", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">WhatsApp Number</label><input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="input-field" /></div>
          </div>
          <div><label className="label-field">Office Address</label><textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field resize-none" /></div>
          <div><label className="label-field">Business Hours</label><input value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} className="input-field" /></div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Invoice business details</h3>
          <p className="text-xs text-navy-400">Optional. Blank legal or GST fields are omitted from generated invoices.</p>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="label-field">Legal business name</label><input value={form.businessLegalName||""} onChange={(e)=>update("businessLegalName",e.target.value)} className="input-field"/></div><div><label className="label-field">GSTIN</label><input value={form.gstNumber||""} onChange={(e)=>update("gstNumber",e.target.value)} className="input-field"/></div></div>
          <div><label className="label-field">Invoice address</label><textarea rows="2" value={form.invoiceAddress||""} onChange={(e)=>update("invoiceAddress",e.target.value)} className="input-field"/></div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Social Links</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(form.social).map((key) => (
              <div key={key}>
                <label className="label-field capitalize">{key}</label>
                <input value={form.social[key]} onChange={(e) => updateSocial(key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Footer</h3>
          <div><label className="label-field">Footer Description Text</label><textarea rows={3} value={form.footerText} onChange={(e) => update("footerText", e.target.value)} className="input-field resize-none" /></div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Homepage featured content</h3>
          <p className="text-xs text-navy-400">Only selected real catalogue items appear in “This Month” sections.</p>
          <div><p className="label-field">Top Trips This Month</p><div className="grid gap-2 sm:grid-cols-2">{tours.map((tour)=><label key={tour.slug} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.topTripSlugs.includes(tour.slug)} onChange={()=>toggleSlug("topTripSlugs",tour.slug)}/>{tour.title}</label>)}</div></div>
          <div><p className="label-field">Top Treks This Month</p><div className="grid gap-2 sm:grid-cols-2">{treks.map((trek)=><label key={trek.slug} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.topTrekSlugs.includes(trek.slug)} onChange={()=>toggleSlug("topTrekSlugs",trek.slug)}/>{trek.name}</label>)}</div></div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Verified trust indicators</h3>
          <p className="text-xs text-navy-400">Leave unverified values blank; blank indicators remain hidden.</p>
          <div className="grid gap-4 sm:grid-cols-2">{[["packageCount","Verified package count"],["googleRating","Google rating"],["googleReviewCount","Google review count"],["googleReviewUrl","Google review URL"],["happyTravellers","Happy travellers"],["msmeRegistration","MSME registration"],["nidhiRegistration","NIDHI registration"]].map(([key,label])=><div key={key}><label className="label-field">{label}</label><input value={form.trustMetrics[key]||""} onChange={(event)=>updateTrust(key,event.target.value)} className="input-field"/></div>)}</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.trustMetrics.support24x7)} onChange={(event)=>updateTrust("support24x7",event.target.checked)}/>Verified 24/7 support</label>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">B2B customer quotation</h3>
          <p className="text-xs text-navy-400">Default markup is applied to agent cost only when a partner creates a customer-facing quotation.</p>
          <div><label className="label-field">Default customer markup (%)</label><input type="number" min="0" max="100" step="0.1" value={form.b2bDefaultMarkupPercent??10} onChange={(event)=>update("b2bDefaultMarkupPercent",event.target.value)} className="input-field"/></div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-navy-800">Team</h3><button type="button" className="btn-secondary" onClick={()=>setForm((current)=>({...current,team:[...current.team,{name:"",role:"",photo:"",bio:"",published:false}]}))}><Plus size={14}/>Add</button></div>
          {form.team.map((member,index)=><div key={index} className="rounded-xl border p-4"><div className="grid gap-3 sm:grid-cols-2"><input placeholder="Name" value={member.name} onChange={(event)=>updateTeam(index,"name",event.target.value)} className="input-field"/><input placeholder="Role" value={member.role} onChange={(event)=>updateTeam(index,"role",event.target.value)} className="input-field"/><input placeholder="Photo URL" value={member.photo} onChange={(event)=>updateTeam(index,"photo",event.target.value)} className="input-field sm:col-span-2"/><textarea placeholder="Short bio" rows="2" value={member.bio} onChange={(event)=>updateTeam(index,"bio",event.target.value)} className="input-field sm:col-span-2"/></div><div className="mt-3 flex justify-between"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={member.published} onChange={(event)=>updateTeam(index,"published",event.target.checked)}/>Published</label><button type="button" onClick={()=>setForm((current)=>({...current,team:current.team.filter((_,itemIndex)=>itemIndex!==index)}))} aria-label="Remove team member"><Trash2 size={16}/></button></div></div>)}
          {!form.team.length&&<p className="text-sm text-navy-400">No team members configured; the public section stays hidden.</p>}
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Social Initiative</h3>
          <div className="grid gap-4 sm:grid-cols-2"><input placeholder="Title" value={form.socialInitiative.title||""} onChange={(event)=>updateInitiative("title",event.target.value)} className="input-field"/><input placeholder="Image URL" value={form.socialInitiative.image||""} onChange={(event)=>updateInitiative("image",event.target.value)} className="input-field"/><input placeholder="Optional link" value={form.socialInitiative.link||""} onChange={(event)=>updateInitiative("link",event.target.value)} className="input-field sm:col-span-2"/><textarea placeholder="Verified short description" rows="3" value={form.socialInitiative.description||""} onChange={(event)=>updateInitiative("description",event.target.value)} className="input-field sm:col-span-2"/></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.socialInitiative.published)} onChange={(event)=>updateInitiative("published",event.target.checked)}/>Published</label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary"><Save size={16} /> Save Settings</button>
          <button type="button" onClick={handleReset} className="btn-secondary">Reset to Default</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-semibold text-forest-600"><CheckCircle2 size={16} /> Saved!</span>}
          {error && <span role="alert" className="text-sm text-terracotta-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
