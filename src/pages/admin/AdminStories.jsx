import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { testimonials as staticStories } from "../../data/content";
import { getAdminStories, saveAdminStory, deleteAdminStory } from "../../utils/storage";
import { StarRating } from "../../components/shared/Bits";
import MediaUploader from "../../components/admin/MediaUploader";
import SmartImage from "../../components/shared/SmartImage";

const emptyStory = {
  name: "", destination: "", rating: 5, testimonial: "",
  image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  published: true,
};

export default function AdminStories() {
  const [adminStories, setAdminStories] = useState(getAdminStories());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyStory);

  const refresh = () => setAdminStories(getAdminStories());
  const openAdd = () => { setForm(emptyStory); setEditing(null); setModalOpen(true); };
  const openEdit = (s) => { setForm(s); setEditing(s.id); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    saveAdminStory(editing ? { ...form, id: editing } : form);
    refresh();
    setModalOpen(false);
  };
  const handleDelete = (id) => { if (confirm("Delete this story?")) { deleteAdminStory(id); refresh(); } };

  const allStories = [
    ...adminStories.map((s) => ({ ...s, isAdmin: true })),
    ...staticStories.map((s, i) => ({ ...s, id: `static-${i}`, testimonial: s.text, isAdmin: false, published: true })),
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Happy Travellers</h1>
          <p className="text-sm text-navy-500 mt-1">Manage testimonials and traveller stories shown on the homepage.</p>
        </div>
        <button onClick={openAdd} className="rounded-full bg-terracotta-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors flex items-center gap-1.5 shrink-0">
          <Plus size={14} /> Add Story
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStories.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white border border-navy-100 shadow-soft p-5">
            <div className="flex items-center gap-3">
              <SmartImage src={s.image} context="traveller portrait" alt="" wrapperClassName="h-11 w-11 rounded-full" className="object-cover" />
              <div>
                <h4 className="text-sm font-semibold text-navy-800">{s.name}</h4>
                <p className="text-xs text-navy-400">{s.destination}</p>
              </div>
            </div>
            <StarRating rating={Number(s.rating)} size={12} showValue={false} />
            <p className="text-xs text-navy-500 mt-2 line-clamp-3">{s.testimonial}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.published !== false ? "bg-forest-50 text-forest-700" : "bg-navy-100 text-navy-500"}`}>
                {s.published !== false ? "Published" : "Draft"}
              </span>
              {s.isAdmin ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(s)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(s.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600 hover:bg-terracotta-100"><Trash2 size={13} /></button>
                </div>
              ) : <span className="text-[10px] text-navy-300 italic">Catalogue item</span>}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-navy-900">{editing ? "Edit Story" : "Add New Story"}</h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label-field">Customer Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
                <div><label className="label-field">Destination</label><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label-field">Rating (1–5)</label><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="input-field" /></div>
                <MediaUploader label="Traveller photo" value={form.image} onChange={(image) => setForm({ ...form, image })} scope={`stories/${editing || "draft"}`} context="traveller portrait" />
              </div>
              <div><label className="label-field">Testimonial</label><textarea rows={4} value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} className="input-field resize-none" /></div>
              <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-terracotta-500" /> Published</label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Story"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
