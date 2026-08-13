import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Download,
  Headphones,
  LogOut,
  Plane,
  WalletCards,
} from "lucide-react";
import BrandLogo from "../components/branding/BrandLogo";
import Seo from "../components/shared/Seo";
import { LoadError, PageLoader } from "../components/shared/Loading";
import {
  downloadProtectedDocument,
  getToken,
  openCashfree,
  portalFetch,
  sessionKey,
} from "../utils/portal";
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = () =>
    portalFetch("/api/portal/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  useEffect(() => {
    if (!getToken()) navigate("/account/login?returnTo=/account/dashboard");
    else load();
  }, [navigate]);
  const download = async (reference, type) => {
    setBusy(`${reference}-${type}`);
    setError("");
    try {
      await downloadProtectedDocument(reference, type);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };
  const pay = async (reference) => {
    setBusy(reference);
    try {
      await openCashfree(reference, "balance");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };
  const cancel = async (booking) => {
    const reason = prompt(
      "Please describe why you need to cancel this booking. NaysTrip will review the applicable fee before any refund action.",
    );
    if (!reason) return;
    setBusy(booking.id);
    try {
      await portalFetch("/api/portal/cancel", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking.id, reason }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };
  const logout = () => {
    sessionStorage.removeItem(sessionKey("customer"));
    navigate("/account/login");
  };
  if (!data) return error ? <LoadError message={error} onRetry={() => { setError(""); load(); }} loginTo="/account/login" /> : <PageLoader full label="Loading your journeys…" />;
  const upcoming = data.bookings.filter(
    (item) => item.travel_date && new Date(item.travel_date) >= new Date(),
  );
  const past = data.bookings.filter(
    (item) => !item.travel_date || new Date(item.travel_date) < new Date(),
  );
  return (
    <>
      <Seo title="Customer Dashboard | NaysTrip" />
      <main className="min-h-screen bg-[#f5f3ed]">
        <header className="border-b bg-white">
          <div className="container-lg flex h-24 items-center justify-between">
            <Link to="/">
              <BrandLogo className="h-20" />
            </Link>
            <button onClick={logout} className="btn-secondary">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>
        <div className="container-lg py-10">
          <p className="eyebrow">Customer portal</p>
          <h1 className="mt-2 font-display text-4xl text-[#173c34]">
            Welcome, {data.profile.firstName || "traveller"}.
          </h1>
          <p className="mt-2 text-slate-600">
            Bookings, payments and documents in one place.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-5 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="bg-white p-5">
              <Plane className="text-orange-600" />
              <p className="mt-3 text-3xl font-bold">{upcoming.length}</p>
              <p className="text-sm text-slate-500">Upcoming trips</p>
            </div>
            <div className="bg-white p-5">
              <WalletCards className="text-orange-600" />
              <p className="mt-3 text-3xl font-bold">
                INR{" "}
                {data.bookings
                  .reduce((sum, item) => sum + Number(item.balance_due || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-slate-500">Balance due</p>
            </div>
            <a
              href="https://wa.me/917710991126"
              className="bg-[#173c34] p-5 text-white"
            >
              <Headphones className="text-orange-300" />
              <p className="mt-3 font-bold">Quick support</p>
              <p className="text-sm text-white/60">WhatsApp NaysTrip</p>
            </a>
          </div>
          <ProfileEditor profile={data.profile} onSaved={load} />
          <section className="mt-10">
            <h2 className="font-display text-2xl text-[#173c34]">
              Upcoming trips
            </h2>
            <div className="mt-4 space-y-5">
              {upcoming.length ? (
                upcoming.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    busy={busy}
                    onDownload={download}
                    onPay={pay}
                    onCancel={cancel}
                  />
                ))
              ) : (
                <div className="bg-white p-8 text-center">
                  <p>No upcoming bookings yet.</p>
                  <Link to="/tours" className="btn-primary mt-4">
                    Explore packages
                  </Link>
                </div>
              )}
            </div>
          </section>
          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl text-[#173c34]">
                Past trips
              </h2>
              <div className="mt-4 space-y-4">
                {past.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    busy={busy}
                    onDownload={download}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
function ProfileEditor({profile,onSaved}) {
  const [editing,setEditing]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({firstName:profile.firstName||"",lastName:profile.lastName||"",phone:profile.phone||"",whatsapp:profile.whatsapp||""});
  const save=async(event)=>{event.preventDefault();setMessage("");try{await portalFetch("/api/portal/profile",{method:"PATCH",body:JSON.stringify(form)});setMessage("Profile updated");setEditing(false);await onSaved()}catch(error){setMessage(error.message)}};
  return <section className="mt-8 rounded-2xl bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl text-[#173c34]">Your profile</h2><p className="text-sm text-slate-500">{profile.email} · {profile.phone||"Phone not added"}</p></div><button type="button" onClick={()=>setEditing(value=>!value)} className="btn-secondary">{editing?"Close":"Edit profile"}</button></div>{message&&<p className="mt-3 text-sm">{message}</p>}{editing&&<form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label><span className="label-field">First name</span><input required value={form.firstName} onChange={event=>setForm({...form,firstName:event.target.value})} className="input-field"/></label><label><span className="label-field">Last name</span><input value={form.lastName} onChange={event=>setForm({...form,lastName:event.target.value})} className="input-field"/></label><label><span className="label-field">Phone</span><input required value={form.phone} onChange={event=>setForm({...form,phone:event.target.value})} className="input-field"/></label><label><span className="label-field">WhatsApp</span><input value={form.whatsapp} onChange={event=>setForm({...form,whatsapp:event.target.value})} className="input-field"/></label><button className="btn-primary sm:col-span-2 lg:col-span-1">Save profile</button></form>}</section>;
}

function BookingCard({ booking, busy, onDownload, onPay, onCancel }) {
  const progress = booking.total
    ? Math.min(
        100,
        Math.round((Number(booking.amount_paid) / Number(booking.total)) * 100),
      )
    : 0;
  return (
    <article className="bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge-pill">
              {booking.operational_status?.replaceAll("_", " ")}
            </span>
            <span className="badge-pill">
              {booking.payment_state?.replaceAll("_", " ")}
            </span>
          </div>
          <h3 className="mt-4 font-display text-2xl text-[#173c34]">
            {booking.package?.title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={15} />
            {booking.travel_date || "Date being confirmed"} ·{" "}
            {booking.traveller_count} travellers
          </p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {booking.reference}
          </p>
        </div>
        <div className="min-w-[260px]">
          <div className="flex justify-between text-xs">
            <span>Payment progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-orange-500"
            />
          </div>
          <p className="mt-2 text-sm">
            Paid INR {Number(booking.amount_paid).toLocaleString("en-IN")} ·
            Balance INR {Number(booking.balance_due).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {["voucher", "itinerary", "invoice", "receipt"].map((type) => (
          <button
            key={type}
            disabled={busy === `${booking.reference}-${type}`}
            onClick={() => onDownload(booking.reference, type)}
            className="btn-secondary capitalize"
          >
            <Download size={14} />
            {busy === `${booking.reference}-${type}` ? "Preparing…" : type}
          </button>
        ))}
        {booking.balance_due > 0 && onPay && (
          <button
            disabled={busy === booking.reference}
            onClick={() => onPay(booking.reference)}
            className="btn-primary"
          >
            <WalletCards size={15} />
            Pay balance
          </button>
        )}
        {onCancel &&
          !booking.cancellations?.length &&
          !["cancelled", "completed", "refunded"].includes(
            booking.operational_status,
          ) && (
            <button
              disabled={busy === booking.id}
              onClick={() => onCancel(booking)}
              className="ml-auto text-sm font-bold text-rose-600"
            >
              Request cancellation
            </button>
          )}
      </div>
      {booking.cancellations?.[0] && (
        <p className="mt-4 bg-orange-50 p-3 text-sm">
          Cancellation request: {booking.cancellations[0].status}
        </p>
      )}
    </article>
  );
}
