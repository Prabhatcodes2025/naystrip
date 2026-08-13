import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import Seo from "../components/shared/Seo";
import { getToken, openCashfree, portalFetch } from "../utils/portal";
const emptyTraveller = (type = "adult") => ({
  type,
  fullName: "",
  dob: "",
  nationality: "Indian",
  idType: "Aadhaar",
  idNumber: "",
  phone: "",
  email: "",
  specialRequirements: "",
});
export default function BookingCheckout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pricing, setPricing] = useState(null);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    departureId: "",
    travelDate: "",
    departureCity: "Mumbai",
    pickupPreference: "",
    adults: 1,
    children: 0,
    infants: 0,
    roomCount: 1,
    roomOccupancy: ["Double"],
    hotelCategory: "3-star",
    addons: [],
    travellers: [emptyTraveller()],
    contact: { email: "", phone: "" },
    emergency: { name: "", phone: "", relationship: "" },
    billing: {
      name: "",
      address: "",
      city: "",
      state: "Maharashtra",
      postalCode: "",
      gstNumber: "",
      companyName: "",
    },
    customerNotes: "",
  });
  useEffect(() => {
    fetch(`/api/bookings/options?slug=${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setOptions(data.package);
        const first = data.package.package_departures?.[0];
        if (first)
          setForm((current) => ({
            ...current,
            departureId: first.id,
            travelDate: first.start_date,
          }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);
  const count = form.adults + form.children + form.infants;
  useEffect(() => {
    setForm((current) => {
      const types = [
        ...Array(current.adults).fill("adult"),
        ...Array(current.children).fill("child"),
        ...Array(current.infants).fill("infant"),
      ];
      return {
        ...current,
        travellers: types.map((type, index) =>
          current.travellers[index]?.type === type
            ? current.travellers[index]
            : emptyTraveller(type),
        ),
      };
    });
  }, [form.adults, form.children, form.infants]);
  const preview = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await fetch("/api/bookings/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: options.id,
          departureId: form.departureId || null,
          adults: form.adults,
          children: form.children,
          infants: form.infants,
          roomCount: form.roomCount,
          addons: form.addons,
        }),
      }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body;
      });
      setPricing(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const updateTraveller = (index, key, value) =>
    setForm((current) => ({
      ...current,
      travellers: current.travellers.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  const travellerDobError = (item) => {
    if (!item.dob) return "Date of birth is required";
    const onDate = form.travelDate || new Date().toISOString().slice(0, 10);
    const birth = new Date(`${item.dob}T00:00:00Z`);
    const travel = new Date(`${onDate}T00:00:00Z`);
    if (Number.isNaN(birth.getTime()) || birth > travel) return "Enter a valid date before travel";
    let age = travel.getUTCFullYear() - birth.getUTCFullYear();
    if (travel.getUTCMonth() < birth.getUTCMonth() || (travel.getUTCMonth() === birth.getUTCMonth() && travel.getUTCDate() < birth.getUTCDate())) age -= 1;
    if (item.type === "adult" && age < 12) return "Adult must be 12 or older on the travel date";
    if (item.type === "child" && (age < 2 || age >= 12)) return "Child must be 2–11 on the travel date";
    if (item.type === "infant" && age >= 2) return "Infant must be under 2 on the travel date";
    return "";
  };
  const validateTravellers = () => form.travellers.every((item) => item.fullName && !travellerDobError(item) && item.nationality && item.idType && item.idNumber);
  const submit = async () => {
    if (!getToken("customer")) {
      navigate(
        `/account/login?returnTo=${encodeURIComponent(`/checkout/${slug}`)}`,
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await portalFetch("/api/bookings/create", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          ...form,
          travellers: form.travellers.map((item) => ({ ...item, travelDate: form.travelDate })),
          packageId: options.id,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      setBooking(result.booking);
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await openCashfree(booking.reference, "advance");
      navigate(`/booking/confirmation/${booking.reference}`, {
        state: { payment: result },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const total = useMemo(() => pricing?.pricing?.total || 0, [pricing]);
  if (loading)
    return (
      <main className="container-lg py-28">
        <p>Loading live booking options…</p>
      </main>
    );
  if (!options || (error && !options))
    return (
      <main className="container-lg py-28">
        <h1 className="section-title">Online booking unavailable</h1>
        <p className="mt-4 text-slate-600">{error}</p>
        <Link to={`/tours/${slug}`} className="btn-primary mt-6">
          Request a custom quote
        </Link>
      </main>
    );
  if (!options.booking_state?.online)
    return (
      <main className="container-lg py-28">
        <h1 className="section-title">
          This route is customised before booking.
        </h1>
        <p className="mt-4 max-w-xl text-slate-600">
          {options.booking_state?.reason ||
            "NaysTrip will confirm the live price, hotel and vehicle before collecting payment."}
        </p>
        <Link to={`/custom-trip?package=${slug}`} className="btn-primary mt-6">
          Customise this package
        </Link>
      </main>
    );
  return (
    <>
      <Seo title={`Book ${options.title} | NaysTrip`} />
      <main className="bg-[#fffaf2] py-10 sm:py-16">
        <div className="container-lg">
          <Link
            to={`/tours/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Back to package
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="mb-7 flex gap-2" aria-label="Checkout progress">
                {["Trip", "Travellers", "Contact", "Review", "Payment"].map(
                  (label, index) => (
                    <div
                      key={label}
                      className={`flex-1 border-t-4 pt-2 text-center text-[10px] font-bold uppercase ${step >= index + 1 ? "border-orange-500 text-[#173c34]" : "border-slate-200 text-slate-400"}`}
                    >
                      {label}
                    </div>
                  ),
                )}
              </div>
              {error && (
                <p
                  role="alert"
                  className="mb-4 bg-rose-50 p-4 text-sm text-rose-700"
                >
                  {error}
                </p>
              )}
              {step === 1 && (
                <div className="bg-white p-6 sm:p-8">
                  <h1 className="font-display text-3xl text-[#173c34]">
                    Choose your trip
                  </h1>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {options.package_departures?.length > 0 ? (
                      <label>
                        <span className="label-field">Departure</span>
                        <select
                          value={form.departureId}
                          onChange={(e) => {
                            const departure = options.package_departures.find(
                              (item) => item.id === e.target.value,
                            );
                            setForm({
                              ...form,
                              departureId: e.target.value,
                              travelDate: departure.start_date,
                            });
                          }}
                          className="input-field"
                        >
                          {options.package_departures.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.start_date} · {item.available_seats} seats
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label>
                        <span className="label-field">Travel date</span>
                        <input
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          value={form.travelDate}
                          onChange={(e) =>
                            setForm({ ...form, travelDate: e.target.value })
                          }
                          className="input-field"
                        />
                      </label>
                    )}
                    <label>
                      <span className="label-field">Departure city</span>
                      <input
                        value={form.departureCity}
                        onChange={(e) =>
                          setForm({ ...form, departureCity: e.target.value })
                        }
                        className="input-field"
                      />
                    </label>
                    {[
                      ["Adults", "adults", 1],
                      ["Children", "children", 0],
                      ["Infants", "infants", 0],
                      ["Rooms", "roomCount", 1],
                    ].map(([label, key, min]) => (
                      <label key={key}>
                        <span className="label-field">{label}</span>
                        <input
                          type="number"
                          min={min}
                          max="20"
                          value={form[key]}
                          onChange={(e) =>
                            setForm({ ...form, [key]: Number(e.target.value) })
                          }
                          className="input-field"
                        />
                      </label>
                    ))}
                    <label>
                      <span className="label-field">Hotel category</span>
                      <select
                        value={form.hotelCategory}
                        onChange={(e) =>
                          setForm({ ...form, hotelCategory: e.target.value })
                        }
                        className="input-field"
                      >
                        <option>Budget</option>
                        <option>3-star</option>
                        <option>4-star</option>
                        <option>5-star</option>
                      </select>
                    </label>
                    <label>
                      <span className="label-field">Pickup preference</span>
                      <input
                        value={form.pickupPreference}
                        onChange={(e) =>
                          setForm({ ...form, pickupPreference: e.target.value })
                        }
                        className="input-field"
                        placeholder="Airport, station or hotel"
                      />
                    </label>
                  </div>
                  {options.package_addons?.length > 0 && (
                    <div className="mt-7">
                      <h2 className="font-bold">Optional services</h2>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {options.package_addons.map((addon) => {
                          const selected = form.addons.some(
                            (item) => item.id === addon.id,
                          );
                          return (
                            <label
                              key={addon.id}
                              className={`border p-4 ${selected ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    addons: e.target.checked
                                      ? [
                                          ...form.addons,
                                          { id: addon.id, quantity: 1 },
                                        ]
                                      : form.addons.filter(
                                          (item) => item.id !== addon.id,
                                        ),
                                  })
                                }
                              />{" "}
                              <strong>{addon.name}</strong>
                              <span className="block text-xs text-slate-500">
                                INR{" "}
                                {Number(addon.unit_amount).toLocaleString(
                                  "en-IN",
                                )}{" "}
                                / {addon.pricing_unit}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button
                    disabled={busy || !form.travelDate}
                    onClick={preview}
                    className="btn-primary mt-8"
                  >
                    {busy ? "Checking…" : "Continue"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="bg-white p-6 sm:p-8">
                  <h1 className="font-display text-3xl text-[#173c34]">
                    Traveller information
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    ID details are encrypted before storage.
                  </p>
                  <div className="mt-6 space-y-6">
                    {form.travellers.map((traveller, index) => (
                      <fieldset
                        key={index}
                        className="border border-slate-200 p-5"
                      >
                        <legend className="px-2 font-bold capitalize">
                          {traveller.type} {index + 1}
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label>
                            <span className="label-field">Full name</span>
                            <input
                              required
                              value={traveller.fullName}
                              onChange={(e) =>
                                updateTraveller(
                                  index,
                                  "fullName",
                                  e.target.value,
                                )
                              }
                              className="input-field"
                            />
                          </label>
                          <label>
                            <span className="label-field">Date of birth</span>
                            <input
                              type="date"
                              required
                              max={form.travelDate || new Date().toISOString().slice(0, 10)}
                              value={traveller.dob}
                              onChange={(e) =>
                                updateTraveller(index, "dob", e.target.value)
                              }
                              className="input-field"
                            />
                            {traveller.dob && travellerDobError(traveller) && <span className="mt-1 block text-xs font-semibold text-rose-600">{travellerDobError(traveller)}</span>}
                          </label>
                          <label>
                            <span className="label-field">Nationality</span>
                            <input
                              value={traveller.nationality}
                              onChange={(e) =>
                                updateTraveller(
                                  index,
                                  "nationality",
                                  e.target.value,
                                )
                              }
                              className="input-field"
                            />
                          </label>
                          <label>
                            <span className="label-field">ID type</span>
                            <select
                              value={traveller.idType}
                              onChange={(e) =>
                                updateTraveller(index, "idType", e.target.value)
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
                            <span className="label-field">ID number</span>
                            <input
                              value={traveller.idNumber}
                              onChange={(e) =>
                                updateTraveller(
                                  index,
                                  "idNumber",
                                  e.target.value,
                                )
                              }
                              className="input-field"
                              autoComplete="off"
                            />
                          </label>
                          {index === 0 && (
                            <>
                              <label>
                                <span className="label-field">
                                  Lead traveller phone
                                </span>
                                <input
                                  value={traveller.phone}
                                  onChange={(e) => {
                                    updateTraveller(
                                      index,
                                      "phone",
                                      e.target.value,
                                    );
                                    setForm((current) => ({
                                      ...current,
                                      contact: {
                                        ...current.contact,
                                        phone: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="input-field"
                                />
                              </label>
                              <label>
                                <span className="label-field">
                                  Lead traveller email
                                </span>
                                <input
                                  type="email"
                                  value={traveller.email}
                                  onChange={(e) => {
                                    updateTraveller(
                                      index,
                                      "email",
                                      e.target.value,
                                    );
                                    setForm((current) => ({
                                      ...current,
                                      contact: {
                                        ...current.contact,
                                        email: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="input-field"
                                />
                              </label>
                            </>
                          )}
                        </div>
                        <label className="mt-4 block">
                          <span className="label-field">
                            Special requirements
                          </span>
                          <textarea
                            value={traveller.specialRequirements}
                            onChange={(e) =>
                              updateTraveller(
                                index,
                                "specialRequirements",
                                e.target.value,
                              )
                            }
                            className="input-field"
                          />
                        </label>
                      </fieldset>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      disabled={!validateTravellers()}
                      onClick={() => setStep(3)}
                      className="btn-primary"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="bg-white p-6 sm:p-8">
                  <h1 className="font-display text-3xl text-[#173c34]">
                    Contact, emergency and billing
                  </h1>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="label-field">Email</span>
                      <input
                        type="email"
                        value={form.contact.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            contact: { ...form.contact, email: e.target.value },
                          })
                        }
                        className="input-field"
                      />
                    </label>
                    <label>
                      <span className="label-field">Phone</span>
                      <input
                        value={form.contact.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            contact: { ...form.contact, phone: e.target.value },
                          })
                        }
                        className="input-field"
                      />
                    </label>
                    <label>
                      <span className="label-field">Emergency contact</span>
                      <input
                        value={form.emergency.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            emergency: {
                              ...form.emergency,
                              name: e.target.value,
                            },
                          })
                        }
                        className="input-field"
                      />
                    </label>
                    <label>
                      <span className="label-field">Emergency phone</span>
                      <input
                        value={form.emergency.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            emergency: {
                              ...form.emergency,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="input-field"
                      />
                    </label>
                    <label>
                      <span className="label-field">Relationship</span>
                      <input
                        value={form.emergency.relationship}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            emergency: {
                              ...form.emergency,
                              relationship: e.target.value,
                            },
                          })
                        }
                        className="input-field"
                      />
                    </label>
                    {[
                      ["Billing name", "name"],
                      ["Address", "address"],
                      ["City", "city"],
                      ["State", "state"],
                      ["Postal code", "postalCode"],
                      ["Company (optional)", "companyName"],
                      ["GST number (optional)", "gstNumber"],
                    ].map(([label, key]) => (
                      <label
                        key={key}
                        className={key === "address" ? "sm:col-span-2" : ""}
                      >
                        <span className="label-field">{label}</span>
                        <input
                          value={form.billing[key]}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              billing: {
                                ...form.billing,
                                [key]: e.target.value,
                              },
                            })
                          }
                          className="input-field"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button onClick={() => setStep(4)} className="btn-primary">
                      Review
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="bg-white p-6 sm:p-8">
                  <h1 className="font-display text-3xl text-[#173c34]">
                    Review booking
                  </h1>
                  <div className="mt-6 space-y-3 text-sm">
                    <p>
                      <strong>Trip:</strong> {options.title}
                    </p>
                    <p>
                      <strong>Date:</strong> {form.travelDate}
                    </p>
                    <p>
                      <strong>Travellers:</strong> {count}
                    </p>
                    <p>
                      <strong>Rooms:</strong> {form.roomCount}
                    </p>
                    <p>
                      <strong>Billing:</strong> {form.billing.name},{" "}
                      {form.billing.city}
                    </p>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setStep(3)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      disabled={busy}
                      onClick={submit}
                      className="btn-primary"
                    >
                      <ShieldCheck size={16} />
                      {busy ? "Creating securely…" : "Create booking"}
                    </button>
                  </div>
                </div>
              )}
              {step === 5 && booking && (
                <div className="bg-white p-6 text-center sm:p-10">
                  <CheckCircle2
                    className="mx-auto text-emerald-600"
                    size={48}
                  />
                  <h1 className="mt-5 font-display text-3xl text-[#173c34]">
                    Booking reserved
                  </h1>
                  <p className="mt-2 text-slate-600">
                    Reference <strong>{booking.reference}</strong>
                  </p>
                  <p className="mt-4">
                    Advance due:{" "}
                    <strong>
                      INR{" "}
                      {Number(booking.advance_required).toLocaleString("en-IN")}
                    </strong>
                  </p>
                  <button
                    disabled={busy}
                    onClick={pay}
                    className="btn-primary mt-7"
                  >
                    <CreditCard size={17} />
                    {busy ? "Opening payment…" : "Pay secure advance"}
                  </button>
                  <Link to="/account/dashboard" className="btn-secondary mt-3">
                    Pay later from dashboard
                  </Link>
                </div>
              )}
            </section>
            <aside className="h-fit bg-[#173c34] p-6 text-white lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">
                Booking summary
              </p>
              <h2 className="mt-3 font-display text-2xl">{options.title}</h2>
              <div className="mt-5 space-y-3 border-t border-white/15 pt-5 text-sm">
                <p className="flex justify-between">
                  <span>Travellers</span>
                  <strong>{count}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Rooms</span>
                  <strong>{form.roomCount}</strong>
                </p>
                {pricing && (
                  <>
                    <p className="flex justify-between">
                      <span>Subtotal</span>
                      <strong>
                        INR {pricing.pricing.subtotal.toLocaleString("en-IN")}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Tax</span>
                      <strong>
                        INR {pricing.pricing.tax.toLocaleString("en-IN")}
                      </strong>
                    </p>
                    <p className="flex justify-between border-t border-white/15 pt-3 text-lg">
                      <span>Total</span>
                      <strong>INR {total.toLocaleString("en-IN")}</strong>
                    </p>
                    <p className="flex justify-between text-orange-200">
                      <span>Advance now</span>
                      <strong>
                        INR{" "}
                        {pricing.pricing.advance_required.toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </p>
                  </>
                )}
              </div>
              <p className="mt-5 flex gap-2 text-xs text-white/60">
                <ShieldCheck size={16} />
                Amounts are calculated again by the server before payment.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
