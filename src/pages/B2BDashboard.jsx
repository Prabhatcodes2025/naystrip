import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import BrandLogo from "../components/branding/BrandLogo";
import { LoadError, PageLoader } from "../components/shared/Loading";
import { getToken, portalFetch, sessionKey } from "../utils/portal";
export default function B2BDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [form, setForm] = useState({
    rateId: "",
    travelDate: "",
    customerName: "",
    email: "",
    phone: "",
    travellers: 1,
    roomCount: 1,
    idType: "Aadhaar",
    idNumber: "",
    nationality: "Indian",
    address: "",
    notes: "",
  });
  const load = () =>
    portalFetch("/api/b2b/dashboard", {}, "agent").then(setData);
  useEffect(() => {
    if (!getToken("agent")) navigate("/b2b/login?returnTo=/b2b/dashboard");
    else load().catch((err) => setError(err.message));
  }, [navigate]);
  const createBooking = async (event) => {
    event.preventDefault();
    setError("");
    setBookingMessage("");
    try {
      const result = await portalFetch(
        "/api/b2b/create-booking",
        {
          method: "POST",
          headers: { "Idempotency-Key": crypto.randomUUID() },
          body: JSON.stringify(form),
        },
        "agent",
      );
      setBookingMessage(
        `Booking ${result.booking.reference} created at the protected agent rate.`,
      );
      setForm((current) => ({
        ...current,
        customerName: "",
        email: "",
        phone: "",
        idNumber: "",
        address: "",
        notes: "",
      }));
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  if (!data) return error ? <LoadError message={error} onRetry={() => { setError(""); load().catch((err) => setError(err.message)); }} loginTo="/b2b/login" /> : <PageLoader full label="Loading partner workspace…" />;
  return (
    <main className="min-h-screen bg-[#f5f3ed]">
      <header className="border-b bg-white">
        <div className="container-lg flex h-24 items-center justify-between">
          <Link to="/">
            <BrandLogo className="h-20" />
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem(sessionKey("agent"));
              navigate("/b2b/login");
            }}
            className="btn-secondary"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>
      <div className="container-lg py-10">
        <p className="eyebrow">Approved partner portal</p>
        <h1 className="mt-2 font-display text-4xl text-[#173c34]">
          {data.agent.business_name}
        </h1>
        <p className="mt-2 text-slate-500">
          Private rates never appear on the public website.
        </p>
        {error && (
          <p role="alert" className="mt-4 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {bookingMessage && (
          <p className="mt-4 bg-emerald-50 p-3 text-sm text-emerald-800">
            {bookingMessage}
          </p>
        )}
        <section className="mt-9">
          <h2 className="font-display text-2xl">B2B packages and rates</h2>
          <div className="mt-4 overflow-x-auto bg-white">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Package</th>
                  <th className="p-4">Retail</th>
                  <th className="p-4">Agent price</th>
                  <th className="p-4">Validity</th>
                </tr>
              </thead>
              <tbody>
                {data.rates.map((rate) => (
                  <tr key={rate.id} className="border-b">
                    <td className="p-4 font-bold">{rate.package?.title}</td>
                    <td className="p-4">
                      INR{" "}
                      {Number(rate.retail_price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      INR{" "}
                      {Number(rate.agent_price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      {rate.valid_from || "—"} to {rate.valid_until || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mt-9 rounded-2xl bg-white p-6">
          <h2 className="font-display text-2xl">Create customer booking</h2>
          <p className="mt-1 text-sm text-slate-500">
            The server applies the selected private agent rate; amounts entered
            in the browser are never accepted.
          </p>
          <form
            onSubmit={createBooking}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label>
              <span className="label-field">Package / rate</span>
              <select
                required
                value={form.rateId}
                onChange={(event) =>
                  setForm({ ...form, rateId: event.target.value })
                }
                className="input-field"
              >
                <option value="">Select rate</option>
                {data.rates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.package?.title} - INR{" "}
                    {Number(rate.agent_price).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label-field">Travel date</span>
              <input
                required
                type="date"
                value={form.travelDate}
                onChange={(event) =>
                  setForm({ ...form, travelDate: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Customer name</span>
              <input
                required
                value={form.customerName}
                onChange={(event) =>
                  setForm({ ...form, customerName: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Customer email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Customer phone</span>
              <input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Travellers</span>
              <input
                required
                min="1"
                max="50"
                type="number"
                value={form.travellers}
                onChange={(event) =>
                  setForm({ ...form, travellers: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Lead traveller ID type</span>
              <select
                value={form.idType}
                onChange={(event) =>
                  setForm({ ...form, idType: event.target.value })
                }
                className="input-field"
              >
                <option>Aadhaar</option>
                <option>Passport</option>
                <option>Driving licence</option>
                <option>Voter ID</option>
              </select>
            </label>
            <label>
              <span className="label-field">Lead traveller ID number</span>
              <input
                required
                value={form.idNumber}
                onChange={(event) =>
                  setForm({ ...form, idNumber: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Rooms</span>
              <input
                required
                min="1"
                type="number"
                value={form.roomCount}
                onChange={(event) =>
                  setForm({ ...form, roomCount: event.target.value })
                }
                className="input-field"
              />
            </label>
            <label className="sm:col-span-2 lg:col-span-3">
              <span className="label-field">Billing address / notes</span>
              <textarea
                rows="3"
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                className="input-field"
              />
            </label>
            <button className="btn-primary sm:col-span-2 lg:col-span-1">
              Create protected-rate booking
            </button>
          </form>
        </section>
        <section className="mt-9">
          <h2 className="font-display text-2xl">Agent bookings</h2>
          <div className="mt-4 grid gap-4">
            {data.bookings.length ? (
              data.bookings.map((booking) => (
                <article key={booking.reference} className="bg-white p-5">
                  <strong>{booking.package?.title}</strong>
                  <p className="mt-1 text-sm">
                    {booking.reference} · {booking.operational_status} · Balance
                    INR {Number(booking.balance_due).toLocaleString("en-IN")}
                  </p>
                </article>
              ))
            ) : (
              <p className="bg-white p-6">No agent bookings yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
