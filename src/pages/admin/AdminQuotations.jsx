import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
const empty = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  inquiryId: "",
  title: "",
  destination: "",
  travelStart: "",
  travelEnd: "",
  travellerCount: 2,
  validUntil: "",
  advanceRequired: 0,
  discount: 0,
  taxPercent: 5,
  terms:
    "Rates are subject to availability until booking confirmation. Payment and cancellation terms apply as stated in the booking voucher.",
  notes: "",
  lines: [
    {
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ],
};
const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("naystrip_admin_session")}`,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) throw new Error(data.error || `Quotation request failed (HTTP ${response.status})`);
  return data;
};
const downloadQuotation = async (quote) => {
  const response = await fetch(`/api/documents/quotation?id=${quote.id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("naystrip_admin_session")}`,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Quotation download failed");
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${quote.reference}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
};
export default function AdminQuotations() {
  const [form, setForm] = useState(empty);
  const [agentFilter,setAgentFilter]=useState("");
  const [quotes, setQuotes] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listFilters,setListFilters]=useState({search:"",status:""});
  const [page,setPage]=useState(1);const pageSize=25;
  const load = useCallback(async () => {
    try {
      setQuotes((await request("/api/admin/quotations"+(/^[a-f0-9-]{36}$/i.test(agentFilter)?"?agentId="+encodeURIComponent(agentFilter):""))).quotations || []);
    } catch (error) {
      setMessage(error.message);
    }
  }, [agentFilter]);
  useEffect(() => {
    load();
  }, [load]);
  const subtotal = useMemo(
    () =>
      form.lines.reduce(
        (sum, line) =>
          sum + Number(line.quantity || 0) * Number(line.unitPrice || 0),
        0,
      ),
    [form.lines],
  );
  const total =
    Math.max(0, subtotal - Number(form.discount || 0)) *
    (1 + Number(form.taxPercent || 0) / 100);
  const filteredQuotes=useMemo(()=>{const term=listFilters.search.trim().toLowerCase();return quotes.filter((quote)=>(!listFilters.status||quote.status===listFilters.status)&&(!term||[quote.reference,quote.customer_name,quote.customer_email,quote.customer_phone,quote.destination,quote.agent?.business_name,quote.agent_id,quote.inquiry?.enquiry_source,quote.created_at].join(" ").toLowerCase().includes(term)))},[quotes,listFilters]);
  const pageCount=Math.max(1,Math.ceil(filteredQuotes.length/pageSize));const visibleQuotes=filteredQuotes.slice((Math.min(page,pageCount)-1)*pageSize,Math.min(page,pageCount)*pageSize);
  const updateLine = (index, key, value) =>
    setForm({
      ...form,
      lines: form.lines.map((line, i) =>
        i === index ? { ...line, [key]: value } : line,
      ),
    });
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { quotation } = await request("/api/admin/quotations", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({ ...form, id: editingId || undefined }),
      });
      setMessage(editingId
        ? `Draft ${quotation.reference} updated successfully.`
        : `Draft ${quotation.reference} created successfully. It now appears in the quotation list below, where you can download its PDF or copy the secure share link.`);
      setForm(empty);
      setEditingId("");
      setQuotes((current) => editingId
        ? current.map((item) => item.id === quotation.id ? quotation : item)
        : [quotation, ...current.filter((item) => item.id !== quotation.id)]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  const action = async (id, kind, status) => {
    try {
      const data = await request("/api/admin/quotation-actions", {
        method: "POST",
        body: JSON.stringify({ id, action: kind, status }),
      });
      if (data.url && kind === "preview") {
        window.open(data.url, "_blank", "noopener,noreferrer");
        setMessage("Secure quotation preview opened in a new tab");
      } else if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setMessage("Secure quotation link copied");
      } else if (data.reference)
        setMessage(`Converted to booking ${data.reference}`);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const editQuote = (quote) => {
    const taxable = Math.max(0, Number(quote.subtotal || 0) - Number(quote.discount || 0));
    setForm({
      customerName: quote.customer_name || "",
      customerEmail: quote.customer_email || "",
      customerPhone: quote.customer_phone || "",
      inquiryId: quote.inquiry_id || "",
      title: quote.title || "",
      destination: quote.destination || "",
      travelStart: quote.travel_start || "",
      travelEnd: quote.travel_end || "",
      travellerCount: quote.traveller_count || 1,
      validUntil: quote.valid_until || "",
      advanceRequired: quote.advance_required || 0,
      discount: quote.discount || 0,
      taxPercent: taxable ? (Number(quote.tax || 0) / taxable) * 100 : 0,
      terms: quote.terms || "",
      notes: quote.notes || "",
      lines: (quote.lines || []).map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unit_price,
      })),
    });
    setEditingId(quote.id);
    setMessage(`Editing ${quote.reference}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div>
      <h1 className="font-display text-2xl">Quotation Builder</h1>
      <p className="mt-1 text-sm text-navy-500">
        Draft, preview, share and convert branded travel proposals.
      </p>
      {message && <p className="my-4 bg-navy-50 p-3 text-sm">{message}</p>}
      <form onSubmit={submit} className="mt-6 rounded-2xl border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Customer name", "customerName"],
            ["Email", "customerEmail"],
            ["Phone", "customerPhone"],
            ["Lead reference", "inquiryId"],
            ["Proposal title", "title"],
            ["Destination", "destination"],
          ].map(([label, key]) => (
            <label key={key}>
              <span className="label-field">{label}</span>
              <input
                type={key === "customerEmail" ? "email" : key === "customerPhone" ? "tel" : "text"}
                placeholder={key === "customerEmail" ? "name@example.com" : key === "customerPhone" ? "+91 98765 43210" : undefined}
                required={["customerName", "title"].includes(key)}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-field"
              />
            </label>
          ))}
          <label>
            <span className="label-field">Travel start</span>
            <input
              type="date"
              value={form.travelStart}
              onChange={(e) =>
                setForm({ ...form, travelStart: e.target.value })
              }
              className="input-field"
            />
          </label>
          <label>
            <span className="label-field">Travel end</span>
            <input
              type="date"
              value={form.travelEnd}
              onChange={(e) => setForm({ ...form, travelEnd: e.target.value })}
              className="input-field"
            />
          </label>
          <label>
            <span className="label-field">Travellers</span>
            <input
              type="number"
              min="1"
              value={form.travellerCount}
              onChange={(e) =>
                setForm({ ...form, travellerCount: e.target.value })
              }
              className="input-field"
            />
          </label>
          <label>
            <span className="label-field">Valid until</span>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="input-field"
            />
          </label>
        </div>
        <div className="mt-7 space-y-3">
          <div className="flex justify-between">
            <h2 className="font-bold">Line items</h2>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  lines: [
                    ...form.lines,
                    { description: "", quantity: 1, unitPrice: 0 },
                  ],
                })
              }
              className="btn-secondary"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
          {form.lines.map((line, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_100px_150px_44px]"
            >
              <input
                required
                placeholder="Description"
                value={line.description}
                onChange={(e) =>
                  updateLine(index, "description", e.target.value)
                }
                className="input-field"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={line.quantity}
                onChange={(e) => updateLine(index, "quantity", e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.unitPrice}
                onChange={(e) => updateLine(index, "unitPrice", e.target.value)}
                className="input-field"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    lines: form.lines.filter((_, i) => i !== index),
                  })
                }
                aria-label="Remove line"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="label-field">Discount</span>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="input-field"
            />
          </label>
          <label>
            <span className="label-field">Tax / GST %</span>
            <input
              type="number"
              value={form.taxPercent}
              onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
              className="input-field"
            />
          </label>
          <label>
            <span className="label-field">Advance required</span>
            <input
              type="number"
              value={form.advanceRequired}
              onChange={(e) =>
                setForm({ ...form, advanceRequired: e.target.value })
              }
              className="input-field"
            />
          </label>
          <label className="sm:col-span-3">
            <span className="label-field">Internal notes / revision requests</span><textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="input-field"/><span className="label-field">Terms and cancellation policy</span>
            <textarea
              rows="4"
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              className="input-field"
            />
          </label>
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <p className="font-display text-2xl">
            Total INR {total.toLocaleString("en-IN")}
          </p>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingId("");
                  setForm(empty);
                  setMessage("");
                }}
              >
                Cancel edit
              </button>
            )}
            <button disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Saving draft…" : editingId ? "Update draft" : "Create draft"}
            </button>
          </div>
        </div>
      </form>
      <section className="mt-8">
        <h2 className="font-display text-xl">All quotations</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><label><span className="label-field">Search</span><input className="input-field" value={listFilters.search} onChange={e=>{setListFilters({...listFilters,search:e.target.value});setPage(1)}} placeholder="Reference, customer, agent, destination"/></label><label><span className="label-field">Status</span><select className="input-field" value={listFilters.status} onChange={e=>{setListFilters({...listFilters,status:e.target.value});setPage(1)}}><option value="">All statuses</option>{["draft","sent","accepted","rejected","expired","cancelled"].map(value=><option key={value}>{value}</option>)}</select></label><label><span className="label-field">Agent ID</span><input className="input-field" value={agentFilter} onChange={e=>setAgentFilter(e.target.value)} placeholder="Full Agent ID (optional)"/></label></div><p className="mt-3 text-sm text-slate-500">{filteredQuotes.length} quotation{filteredQuotes.length===1?"":"s"} · newest first</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Agent / Agency</th>
                <th className="p-4">Enquiry</th>
                <th className="p-4">Source / date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuotes.map((quote) => (
                <tr key={quote.id} className="border-b">
                  <td className="p-4 font-mono">{quote.reference}</td>
                  <td className="p-4">{quote.customer_name}</td>
                  <td className="p-4">{quote.agent?.business_name||quote.agent_id||"Direct"}<span className="block text-xs">{quote.agent_id}</span>{quote.notes?.includes("Revision requested")&&<strong className="block text-xs text-orange-700">Revision requested — open Edit to review</strong>}</td>
                  <td className="p-4 font-mono text-xs">{quote.inquiry?.id||quote.inquiry_id||"—"}</td>
                  <td className="p-4 text-xs"><strong className="block capitalize">{quote.inquiry?.enquiry_source|| (quote.agent_id?"B2B partner":"Admin")}</strong>{new Date(quote.created_at).toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    INR {Number(quote.total).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    <select
                      value={quote.status}
                      onChange={(e) =>
                        action(quote.id, "status", e.target.value)
                      }
                      className="input-field py-2"
                    >
                      <option>draft</option>
                      <option>sent</option>
                      <option>accepted</option>
                      <option>rejected</option>
                      <option>expired</option>
                      <option>cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editQuote(quote)}
                        className="btn-secondary"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => action(quote.id, "preview")}
                        className="btn-secondary"
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadQuotation(quote).catch((error) =>
                            setMessage(error.message),
                          )
                        }
                        className="btn-secondary"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                      <button
                        onClick={() => action(quote.id, "share")}
                        className="btn-secondary"
                      >
                        <Copy size={14} />
                        Share
                      </button>
                      <button
                        disabled={Boolean(quote.converted_booking_id)}
                        onClick={() => action(quote.id, "convert")}
                        className="btn-primary"
                      >
                        Convert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredQuotes.length&&<p className="rounded-b-2xl border border-t-0 bg-white p-8 text-center text-slate-400">No quotations match the current filters.</p>}
        {pageCount>1&&<div className="mt-4 flex items-center justify-end gap-3"><button type="button" disabled={page<=1} onClick={()=>setPage(value=>Math.max(1,value-1))} className="btn-secondary">Previous</button><span className="text-sm">Page {Math.min(page,pageCount)} of {pageCount}</span><button type="button" disabled={page>=pageCount} onClick={()=>setPage(value=>Math.min(pageCount,value+1))} className="btn-secondary">Next</button></div>}
      </section>
    </div>
  );
}
