import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Search, ShieldX } from "lucide-react";
import { PageLoader } from "../../components/shared/Loading";

const request = async (options = {}) => {
  const response = await fetch("/api/admin/agents", { ...options, headers: { Authorization: `Bearer ${sessionStorage.getItem("naystrip_admin_session") || ""}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Partner operation failed");
  return data;
};

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const load = () => { setLoading(true); setError(""); request().then((data) => setAgents(data.agents)).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const update = async (id, status) => { setBusy(id); setError(""); try { await request({ method: "PATCH", body: JSON.stringify({ id, status }) }); await load(); } catch (err) { setError(err.message); } finally { setBusy(""); } };
  const filtered = useMemo(() => agents.filter((agent) => `${agent.business_name} ${agent.contact_person} ${agent.email} ${agent.phone}`.toLowerCase().includes(search.toLowerCase())), [agents, search]);
  if (loading && !agents.length) return <PageLoader label="Loading partner applications…" />;
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-2xl text-navy-900">B2B Partner Approvals</h1><p className="mt-1 text-sm text-navy-500">Review registrations before private rates and booking tools are unlocked.</p></div><button onClick={load} disabled={loading} className="btn-secondary"><RefreshCw size={15} />Refresh</button></div>
    {error && <p role="alert" className="mt-5 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <label className="relative mt-6 block max-w-md"><Search size={15} className="absolute left-3 top-3.5 text-navy-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="input-field pl-9" placeholder="Search business, contact or email" /></label>
    <div className="mt-5 overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b text-left"><th className="p-4">Business</th><th className="p-4">Contact</th><th className="p-4">Registration</th><th className="p-4">Documents</th><th className="p-4">Status</th><th className="p-4">Decision</th></tr></thead><tbody>{filtered.map((agent) => <tr key={agent.id} className="border-b align-top"><td className="p-4"><strong>{agent.business_name}</strong><span className="mt-1 block text-xs text-navy-400">{agent.business_type || "Business type not supplied"}</span></td><td className="p-4">{agent.contact_person}<span className="block text-xs text-navy-400">{agent.email} · {agent.phone}</span></td><td className="p-4"><span className="block">GST: {agent.gst_number || "—"}</span><span className="block">PAN: {agent.pan || "—"}</span></td><td className="p-4">{agent.documents?.length || 0} uploaded</td><td className="p-4 capitalize"><span className={`rounded-full px-3 py-1 text-xs font-bold ${agent.verification_status === "approved" ? "bg-emerald-50 text-emerald-700" : agent.verification_status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{agent.verification_status}</span></td><td className="p-4"><div className="flex gap-2"><button disabled={busy === agent.id || agent.verification_status === "approved"} onClick={() => update(agent.id, "approved")} className="btn-secondary"><CheckCircle2 size={14} />Approve</button><button disabled={busy === agent.id || agent.verification_status === "rejected"} onClick={() => update(agent.id, "rejected")} className="btn-secondary text-rose-700"><ShieldX size={14} />Reject</button></div></td></tr>)}{!filtered.length && <tr><td colSpan="6" className="p-8 text-center text-navy-400">No partner applications match this view.</td></tr>}</tbody></table></div>
  </div>;
}
