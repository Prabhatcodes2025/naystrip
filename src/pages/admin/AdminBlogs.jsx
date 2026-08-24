import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { blogs as staticBlogs } from "../../data/content";
import { getAdminBlogs, saveAdminBlog, deleteAdminBlog } from "../../utils/storage";
import MediaUploader from "../../components/admin/MediaUploader";
import SmartImage from "../../components/shared/SmartImage";

const emptyBlog = {
  title: "", slug: "", category: "Travel Guides", description: "", content: "", seoTitle:"", seoDescription:"",
  image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  published: true,
};

export default function AdminBlogs() {
  const [adminBlogs, setAdminBlogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [search, setSearch] = useState("");
  const [error,setError]=useState("");

  const refresh = async () => {try{setAdminBlogs(await getAdminBlogs());setError("")}catch(err){setError(err.message)}};
  useEffect(()=>{refresh()},[]);
  const openAdd = () => { setForm(emptyBlog); setEditing(null); setModalOpen(true); };
  const openEdit = (b) => { setForm(b); setEditing(b.id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try{await saveAdminBlog(editing ? { ...form, id: editing } : form);await refresh();setModalOpen(false)}catch(err){setError(err.message)}
  };
  const handleDelete = async (id) => { if (confirm("Delete this blog post?")) { try{await deleteAdminBlog(id);await refresh()}catch(err){setError(err.message)} } };

  const allBlogs = [
    ...adminBlogs.map((b) => ({ ...b, isAdmin: true })),
    ...staticBlogs.map((b) => ({ ...b, id: b.slug, isAdmin: false, published: true })),
  ].filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Blog Management</h1>
          <p className="text-sm text-navy-500 mt-1">Publish and manage articles shown on the travel blog.</p>
        </div>
        <button onClick={openAdd} className="rounded-full bg-terracotta-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors flex items-center gap-1.5 shrink-0">
          <Plus size={14} /> Add Blog
        </button>
      </div>
      {error&&<p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." className="w-full rounded-xl border border-navy-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-terracotta-400" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBlogs.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white border border-navy-100 shadow-soft overflow-hidden">
            <SmartImage src={b.image} context={`blog ${b.category}`} alt="" wrapperClassName="aspect-[16/9]" className="object-cover" />
            <div className="p-4">
              <span className="text-[11px] font-semibold text-terracotta-600">{b.category}</span>
              <h4 className="text-sm font-semibold text-navy-800 mt-1 line-clamp-2">{b.title}</h4>
              <div className="mt-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${b.published !== false ? "bg-forest-50 text-forest-700" : "bg-navy-100 text-navy-500"}`}>
                  {b.published !== false ? "Published" : "Draft"}
                </span>
                {b.isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(b)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(b.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600 hover:bg-terracotta-100"><Trash2 size={13} /></button>
                  </div>
                ) : <span className="text-[10px] text-navy-300 italic">Catalogue item</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-navy-900">{editing ? "Edit Blog" : "Add New Blog"}</h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="label-field">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
              <div><label className="label-field">Slug</label><input value={form.slug||""} onChange={(e)=>setForm({...form,slug:e.target.value})} placeholder="Generated from title when blank" className="input-field"/></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option>Travel Guides</option><option>Destinations</option><option>Trekking</option><option>Travel Tips</option>
                  </select>
                </div>
                <MediaUploader label="Cover image" value={form.image} onChange={(image) => setForm({ ...form, image })} scope={`blogs/${editing || "draft"}`} context={`blog ${form.category}`} />
              </div>
              <div><label className="label-field">Short Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value, excerpt: e.target.value })} className="input-field resize-none" /></div>
              <div><label className="label-field">Full Content</label><textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field resize-none" /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="label-field">SEO title</label><input value={form.seoTitle||""} onChange={(e)=>setForm({...form,seoTitle:e.target.value})} className="input-field"/></div><div><label className="label-field">SEO description</label><textarea rows="2" value={form.seoDescription||""} onChange={(e)=>setForm({...form,seoDescription:e.target.value})} className="input-field"/></div></div>
              <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-terracotta-500" /> Published</label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Blog"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
