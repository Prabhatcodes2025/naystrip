import { useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import SmartImage from "../shared/SmartImage";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function uploadImage(file, scope, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.setRequestHeader("Authorization", `Bearer ${sessionStorage.getItem("naystrip_admin_session") || ""}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("X-Media-Scope", scope);
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    xhr.onload = () => { const data = JSON.parse(xhr.responseText || "{}"); if (xhr.status >= 200 && xhr.status < 300) resolve(data); else reject(new Error(data.error || "Image upload failed")); };
    xhr.onerror = () => reject(new Error("Image upload was interrupted"));
    xhr.send(file);
  });
}

export default function MediaUploader({ label = "Image", value = [], onChange, scope = "general", multiple = false, context = "travel" }) {
  const input = useRef(null);
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const [state, setState] = useState({ busy: false, progress: 0, error: "", ok: "" });
  const choose = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const invalid = files.find((file) => !allowed.has(file.type) || file.size > MAX_BYTES);
    if (invalid) { setState({ busy: false, progress: 0, error: allowed.has(invalid.type) ? "Images must be 5 MB or smaller" : "Choose a JPG, PNG or WebP image", ok: "" }); event.target.value = ""; return; }
    setState({ busy: true, progress: 0, error: "", ok: "" });
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadImage(file, scope, (progress) => setState((current) => ({ ...current, progress }))));
      const next = multiple ? [...values, ...uploaded.map((item) => item.url)] : [uploaded[0].url];
      onChange(multiple ? next : next[0]);
      setState({ busy: false, progress: 100, error: "", ok: `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded` });
    } catch (error) { setState({ busy: false, progress: 0, error: error.message, ok: "" }); }
    event.target.value = "";
  };
  const remove = (index) => { const next = values.filter((_, itemIndex) => itemIndex !== index); onChange(multiple ? next : next[0] || ""); setState({ busy: false, progress: 0, error: "", ok: "Image removed from this record. Save to apply." }); };
  return <div>
    <span className="label-field">{label}</span>
    {values.length > 0 && <div className={`mb-3 grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "max-w-sm"}`}>{values.map((url, index) => <div key={`${url}-${index}`} className="relative aspect-video overflow-hidden rounded-xl border bg-slate-100"><SmartImage src={url} context={context} alt={`${label} preview`} className="object-cover"/><button type="button" onClick={() => remove(index)} aria-label="Remove image" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-rose-600 shadow"><Trash2 size={15}/></button></div>)}</div>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={choose} className="sr-only"/>
    <button type="button" disabled={state.busy} onClick={() => input.current?.click()} className="btn-secondary"><ImagePlus size={16}/>{state.busy ? `Uploading ${state.progress}%` : values.length ? (multiple ? "Add images" : "Replace image") : "Choose image"}</button>
    {state.busy && <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-slate-200"><span className="block h-full bg-orange-500 transition-all" style={{ width: `${state.progress}%` }}/></div>}
    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><UploadCloud size={13}/>JPG, PNG or WebP · maximum 5 MB</p>
    {state.error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{state.error}</p>}
    {state.ok && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{state.ok}</p>}
  </div>;
}
