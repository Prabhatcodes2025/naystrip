import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
const empty = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  inquiryId: "",
  title: "Custom travel proposal",
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
      description: "Package services as per agreed itinerary",
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
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
  const [quotes, setQuotes] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try {
      setQuotes((await request("/api/admin/quotations")).quotations || []);
    } catch (error) {
      setMessage(error.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
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
  const updateLine = (index, key, value) =>
    setForm({
      ...form,
      lines: form.lines.map((line, i) =>
        i === index ? { ...line, [key]: value } : line,
      ),
    });
  const submit = async (event) => {
    event.preventDefault();
    try {
      const { quotation } = await request("/api/admin/quotations", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage(`Draft ${quotation.reference} created successfully. It now appears in the quotation list below, where you can download its PDF or copy the secure share link.`);
      setForm(empty);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const action = async (id, kind, status) => {
    try {
      const data = await request("/api/admin/quotation-actions", {
        method: "POST",
        body: JSON.stringify({ id, action: kind, status }),
      });
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setMessage("Secure quotation link copied");
      } else if (data.reference)
        setMessage(`Converted to booking ${data.reference}`);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
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
            <span className="label-field">Terms and cancellation policy</span>
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
          <button className="btn-primary">Create draft</button>
        </div>
      </form>
      <section className="mt-8">
        <h2 className="font-display text-xl">Recent quotations</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b">
                  <td className="p-4 font-mono">{quote.reference}</td>
                  <td className="p-4">{quote.customer_name}</td>
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
                    <div className="flex gap-2">
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
      </section>
    </div>
  );
}
