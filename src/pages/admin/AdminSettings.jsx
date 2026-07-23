import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { defaultSiteSettings, getSiteSettings, saveSiteSettings } from "../../data/siteConfig";

export default function AdminSettings() {
  const [form, setForm] = useState(getSiteSettings());
  const [saved, setSaved] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateSocial = (field, value) => setForm((f) => ({ ...f, social: { ...f.social, [field]: value } }));

  const handleSave = (e) => {
    e.preventDefault();
    saveSiteSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default?")) {
      setForm(defaultSiteSettings);
      saveSiteSettings(defaultSiteSettings);
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
            <div><label className="label-field">Website Logo Text</label><input value={form.brandName} onChange={(e) => update("brandName", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Homepage CTA Text</label><input value={form.homepageCtaText} onChange={(e) => update("homepageCtaText", e.target.value)} className="input-field" /></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-semibold text-navy-800">Contact Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label-field">Phone Number</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Support Phone</label><input value={form.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Email</label><input value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field" /></div>
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
        </div>
      </form>
    </div>
  );
}
