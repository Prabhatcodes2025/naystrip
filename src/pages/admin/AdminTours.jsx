import { useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { tours as staticTours } from "../../data/tours";
import { getAdminTours, saveAdminTour, deleteAdminTour } from "../../utils/storage";

const emptyTour = {
  title: "", destination: "", type: "Domestic", tripType: "Adventure", duration: "",
  price: "", originalPrice: "", category: "", holidayType: "", fixedDepartureCategory: "",
  description: "", itinerary: "", featured: false, published: true,
  image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
};

export default function AdminTours() {
  const [adminTours, setAdminTours] = useState(getAdminTours());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTour);
  const [search, setSearch] = useState("");

  const refresh = () => setAdminTours(getAdminTours());

  const openAdd = () => { setForm(emptyTour); setEditing(null); setModalOpen(true); };
  const openEdit = (t) => { setForm(t); setEditing(t.id); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    saveAdminTour(editing ? { ...form, id: editing } : form);
    refresh();
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this tour? This cannot be undone.")) {
      deleteAdminTour(id);
      refresh();
    }
  };

  const allTours = [
    ...adminTours.map((t) => ({ ...t, isAdmin: true })),
    ...staticTours.map((t) => ({ ...t, id: t.slug, isAdmin: false, published: true })),
  ].filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Tour Management</h1>
          <p className="text-sm text-navy-500 mt-1">Add, edit and manage tour packages shown on the website.</p>
        </div>
        <button onClick={openAdd} className="rounded-full bg-terracotta-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors flex items-center gap-1.5 shrink-0">
          <Plus size={14} /> Add Tour
        </button>
      </div>

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tours..." className="w-full rounded-xl border border-navy-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-terracotta-400" />
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-navy-400 border-b border-navy-100 bg-navy-50/40">
              <th className="p-4 font-medium">Tour</th>
              <th className="p-4 font-medium">Destination</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTours.map((t) => (
              <tr key={t.id} className="border-b border-navy-50 last:border-0">
                <td className="p-4 flex items-center gap-3">
                  <img src={t.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="font-medium text-navy-800 line-clamp-1 max-w-[200px]">{t.title}</span>
                </td>
                <td className="p-4 text-navy-500">{t.destination}</td>
                <td className="p-4 text-navy-500">{t.type}</td>
                <td className="p-4 text-navy-500">₹{Number(t.price).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.published !== false ? "bg-forest-50 text-forest-700" : "bg-navy-100 text-navy-500"}`}>
                    {t.published !== false ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="p-4">
                  {t.isAdmin ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(t.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600 hover:bg-terracotta-100"><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-navy-300 italic block text-right">Catalogue item</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-navy-900">{editing ? "Edit Tour" : "Add New Tour"}</h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label-field">Tour Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
                <div><label className="label-field">Destination</label><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-field" /></div>
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option>Domestic</option><option>International</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Holiday Type</label>
                  <select value={form.tripType} onChange={(e) => setForm({ ...form, tripType: e.target.value })} className="input-field">
                    <option>Adventure</option><option>Honeymoon</option><option>Family</option><option>Luxury</option><option>Wildlife</option>
                  </select>
                </div>
                <div><label className="label-field">Duration</label><input placeholder="e.g. 5 Days / 4 Nights" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" /></div>
                <div><label className="label-field">Fixed Departure Category</label><input value={form.fixedDepartureCategory} onChange={(e) => setForm({ ...form, fixedDepartureCategory: e.target.value })} className="input-field" placeholder="Optional" /></div>
                <div><label className="label-field">Price (₹)</label><input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" /></div>
                <div><label className="label-field">Original Price (₹)</label><input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="label-field">Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" /></div>
              <div><label className="label-field">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" /></div>
              <div><label className="label-field">Itinerary (one line per day)</label><textarea rows={4} value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} className="input-field resize-none" placeholder="Day 1: Arrival..." /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-terracotta-500" /> Featured</label>
                <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-terracotta-500" /> Published</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Tour"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
