import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { defaultSiteSettings, getSiteSettings, loadSiteSettings, saveSiteSettings } from "../../data/siteConfig";
import BrandLogo from "../../components/branding/BrandLogo";

export default function AdminSettings() {
  const [form, setForm] = useState(getSiteSettings());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(()=>{loadSiteSettings().then(setForm).catch(()=>{})},[]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateSocial = (field, value) => setForm((f) => ({ ...f, social: { ...f.social, [field]: value } }));

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
            <div><label className="label-field">Cancellation Email</label><input type="email" value={form.cancellationEmail} onChange={(e) => update("cancellationEmail", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">WhatsApp Number</label><input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="input-field" /></div>
          </div>
          <div><label className="label-field">Office Address</label><textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field resize-none" /></div>
          <div><label className="label-field">Business Hours</label><input value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} className="input-field" /></div>
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
