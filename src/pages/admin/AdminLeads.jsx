import { useState } from "react";
import { Eye, Trash2, X, Search } from "lucide-react";
import { getCustomLeads, updateCustomLeadStatus, deleteCustomLead } from "../../utils/storage";

const statuses = ["New", "Contacted", "Follow-up", "Converted", "Closed"];
const statusColor = {
  New: "bg-terracotta-50 text-terracotta-700",
  Contacted: "bg-navy-50 text-navy-700",
  "Follow-up": "bg-gold-50 text-gold-700",
  Converted: "bg-forest-50 text-forest-700",
  Closed: "bg-navy-100 text-navy-500",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState(getCustomLeads());
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const refresh = () => setLeads(getCustomLeads());

  const handleStatusChange = (id, status) => { updateCustomLeadStatus(id, status); refresh(); };
  const handleDelete = (id) => { if (confirm("Delete this lead?")) { deleteCustomLead(id); refresh(); setViewing(null); } };

  const filtered = leads.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (search && !`${l.firstName} ${l.lastName} ${l.to}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Custom Trip Leads</h1>
      <p className="text-sm text-navy-500 mt-1 mb-6">Inquiries submitted through the Custom Trip planner.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative sm:max-w-xs w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." className="w-full rounded-xl border border-navy-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-terracotta-400" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm focus:outline-none">
          <option>All</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-xs text-navy-400 border-b border-navy-100 bg-navy-50/40">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Destination</th>
              <th className="p-4 font-medium">Departure</th>
              <th className="p-4 font-medium">Budget</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-navy-400">No leads yet.</td></tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="border-b border-navy-50 last:border-0">
                <td className="p-4 font-mono text-xs text-navy-500">{l.id}</td>
                <td className="p-4 font-medium text-navy-800">{l.firstName} {l.lastName}</td>
                <td className="p-4 text-navy-500">{l.phone}</td>
                <td className="p-4 text-navy-500">{l.to || "—"}</td>
                <td className="p-4 text-navy-500">{l.departureDate || "—"}</td>
                <td className="p-4 text-navy-500">{l.budget}</td>
                <td className="p-4 text-navy-500">{new Date(l.submittedAt).toLocaleDateString("en-IN")}</td>
                <td className="p-4">
                  <select value={l.status} onChange={(e) => handleStatusChange(l.id, e.target.value)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border-none focus:outline-none ${statusColor[l.status]}`}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setViewing(l)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"><Eye size={14} /></button>
                    <button onClick={() => handleDelete(l.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600 hover:bg-terracotta-100"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setViewing(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-navy-900">Lead Details</h3>
              <button onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <dl className="space-y-3 text-sm">
              {Object.entries({
                "Inquiry ID": viewing.id,
                Name: `${viewing.firstName} ${viewing.lastName}`,
                Phone: viewing.phone,
                Email: viewing.email,
                From: viewing.from,
                To: viewing.to,
                "Departure Date": viewing.departureDate,
                Nights: viewing.nights,
                Adults: viewing.adults,
                Minors: viewing.minors,
                "Trip Type": viewing.tripType,
                Budget: viewing.budget,
                "Additional Details": viewing.details || "—",
                Status: viewing.status,
              }).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-navy-50 pb-2">
                  <dt className="text-navy-400">{k}</dt>
                  <dd className="text-navy-800 font-medium text-right">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
