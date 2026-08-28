import { useEffect, useState } from "react";
import { Eye, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { blogs as staticBlogs } from "../../data/content";
import { getAdminBlogs, saveAdminBlog, deleteAdminBlog } from "../../utils/storage";
import MediaUploader from "../../components/admin/MediaUploader";
import SmartImage from "../../components/shared/SmartImage";

const emptyBlog = {
  title: "", subtitle: "", slug: "", category: "Travel Guides", description: "", content: "", author: "", seoTitle:"", seoDescription:"",
  image: "", featured: false, published: false,
};

export default function AdminBlogs() {
  const [adminBlogs, setAdminBlogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [search, setSearch] = useState("");
  const [error,setError]=useState("");
  const [preview,setPreview]=useState(false);

  const refresh = async () => {try{setAdminBlogs(await getAdminBlogs());setError("")}catch(err){setError(err.message)}};
  useEffect(()=>{refresh()},[]);
  const openAdd = () => { setForm(emptyBlog); setEditing(null); setPreview(false); setModalOpen(true); };
  const openEdit = (b) => { setForm({...emptyBlog,...b}); setEditing(b.id); setPreview(false); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try{await saveAdminBlog(editing ? { ...form, id: editing } : form);await refresh();setModalOpen(false)}catch(err){setError(err.message)}
  };
  const handleDelete = async (id) => { if (confirm("Delete this blog post?")) { try{await deleteAdminBlog(id);await refresh()}catch(err){setError(err.message)} } };
  const togglePublish = async (blog) => { try{await saveAdminBlog({...blog,published:!blog.published,id:blog.id});await refresh()}catch(err){setError(err.message)} };

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

      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block"><table className="w-full min-w-[920px] text-sm"><thead><tr className="border-b bg-navy-50/50 text-left text-xs uppercase text-navy-400"><th className="p-3">Cover</th><th className="p-3">Article</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{allBlogs.map((b)=><tr key={b.id} className="border-b"><td className="p-3"><SmartImage src={b.image} context={`blog ${b.category}`} alt="" wrapperClassName="h-16 w-24 overflow-hidden rounded-lg" className="object-cover"/></td><td className="max-w-sm p-3"><strong className="block line-clamp-1 text-navy-800">{b.title}</strong><span className="mt-1 block line-clamp-1 text-xs text-navy-500">{b.subtitle||b.description||b.excerpt||"—"}</span></td><td className="p-3">{b.category}</td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${b.published!==false?"bg-forest-50 text-forest-700":"bg-navy-100 text-navy-500"}`}>{b.published!==false?"Published":"Draft"}</span></td><td className="p-3 text-xs text-navy-500">{b.created_at?new Date(b.created_at).toLocaleDateString("en-IN"):b.date||"Catalogue"}</td><td className="p-3"><div className="flex justify-end gap-2">{b.isAdmin?<><button title="Edit" onClick={()=>openEdit(b)} className="btn-secondary px-3"><Pencil size={13}/>Edit</button><a title="Preview" href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" className="btn-secondary px-3"><Eye size={13}/>Preview</a><button onClick={()=>togglePublish(b)} className="btn-secondary px-3">{b.published?"Unpublish":"Publish"}</button><button title="Delete" onClick={()=>handleDelete(b.id)} className="btn-secondary px-3 text-terracotta-600"><Trash2 size={13}/>Delete</button></>:<span className="text-xs italic text-navy-300">Catalogue item</span>}</div></td></tr>)}</tbody></table></div>
      <div className="grid gap-3 md:hidden">{allBlogs.map((b)=><article key={b.id} className="flex gap-3 rounded-2xl border bg-white p-3"><SmartImage src={b.image} context={`blog ${b.category}`} alt="" wrapperClassName="h-20 w-24 shrink-0 overflow-hidden rounded-lg" className="object-cover"/><div className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase text-terracotta-600">{b.category} · {b.published!==false?"Published":"Draft"}</span><h3 className="mt-1 line-clamp-1 text-sm font-bold">{b.title}</h3><p className="line-clamp-1 text-xs text-navy-500">{b.subtitle||b.description||b.excerpt||"—"}</p>{b.isAdmin&&<div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>openEdit(b)} className="text-xs font-bold">Edit</button><a href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" className="text-xs font-bold">Preview</a><button onClick={()=>togglePublish(b)} className="text-xs font-bold">{b.published?"Unpublish":"Publish"}</button><button onClick={()=>handleDelete(b.id)} className="text-xs font-bold text-terracotta-600">Delete</button></div>}</div></article>)}</div>

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
              <div><label className="label-field">Subtitle</label><input value={form.subtitle||""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" /></div>
              <div><label className="label-field">Slug</label><input value={form.slug||""} onChange={(e)=>setForm({...form,slug:e.target.value})} placeholder="Generated from title when blank" className="input-field"/></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option>Travel Guides</option><option>Destinations</option><option>Trekking</option><option>Travel Tips</option>
                  </select>
                </div>
                <MediaUploader compact label="Cover image" value={form.image} onChange={(image) => setForm({ ...form, image })} scope={`blogs/${editing || "draft"}`} context={`blog ${form.category}`} />
              </div>
              <div><label className="label-field">Short Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value, excerpt: e.target.value })} className="input-field resize-none" /></div>
              <div><label className="label-field">Display author</label><input value={form.author||""} onChange={(e)=>setForm({...form,author:e.target.value})} className="input-field"/></div>
              <div><label className="label-field">Full Content</label><textarea required rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field resize-y" /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="label-field">SEO title</label><input value={form.seoTitle||""} onChange={(e)=>setForm({...form,seoTitle:e.target.value})} className="input-field"/></div><div><label className="label-field">SEO description</label><textarea rows="2" value={form.seoDescription||""} onChange={(e)=>setForm({...form,seoDescription:e.target.value})} className="input-field"/></div></div>
              <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-terracotta-500" /> Published</label><label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-terracotta-500" /> Featured</label></div>
              {preview&&<article className="rounded-2xl border bg-[#fffaf2] p-5">{form.image&&<img src={form.image} alt="" className="mb-4 aspect-[16/9] max-h-64 w-full rounded-xl object-cover"/>}<p className="text-xs font-bold uppercase text-terracotta-600">{form.category}</p><h2 className="mt-2 font-display text-3xl text-navy-900">{form.title||"Untitled article"}</h2>{form.subtitle&&<p className="mt-2 text-lg text-navy-600">{form.subtitle}</p>}<p className="mt-4 whitespace-pre-line text-sm leading-7 text-navy-600">{form.content||"Article content preview"}</p></article>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setPreview((value)=>!value)} className="btn-secondary"><Eye size={15}/>{preview?"Hide Preview":"Preview"}</button>
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
