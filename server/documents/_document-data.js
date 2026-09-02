import { defaultSiteSettings } from "../../src/data/siteConfig.js";
import { supabaseRequest } from "../_shared.js";

export const GENERATED_DOCUMENT_TYPES = new Set(["hotel_voucher", "transport_voucher", "invoice", "itinerary"]);
export const DOCUMENT_FORMATS = new Set(["pdf", "docx"]);

const present = (value) => value !== undefined && value !== null && String(value).trim() !== "";
const text = (value) => present(value) ? String(value).trim() : "";
const list = (value) => Array.isArray(value) ? value.filter(present).map(text) : text(value).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const money = (value, currency = "INR") => present(value) && Number.isFinite(Number(value)) ? `${currency} ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "";
const date = (value) => {
  if (!present(value)) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? text(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const rows = (entries) => entries.filter(([, value]) => present(value)).map(([label, value]) => ({ label, value: text(value) }));
const safeReference = (value) => text(value).replace(/[^A-Za-z0-9-]/g, "").slice(0, 60) || "DOCUMENT";

export async function documentSettings() {
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return defaultSiteSettings;
  try {
    const response = await supabaseRequest("website_settings?id=eq.true&select=data&limit=1");
    const body = await response.json();
    if (response.ok && Array.isArray(body)) return { ...defaultSiteSettings, ...(body[0]?.data || {}) };
  } catch (error) {
    console.error("document_settings_lookup_failed", { error });
  }
  return defaultSiteSettings;
}

export function amountInWords(value) {
  const number = Math.round(Number(value) || 0);
  if (number === 0) return "Zero rupees only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underHundred = (n) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`;
  const underThousand = (n) => `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? " " : ""}` : ""}${underHundred(n % 100)}`.trim();
  const parts = [];
  let remaining = number;
  for (const [unit, size] of [["Crore", 10_000_000], ["Lakh", 100_000], ["Thousand", 1_000]]) {
    const count = Math.floor(remaining / size);
    if (count) { parts.push(`${underThousand(count)} ${unit}`); remaining %= size; }
  }
  if (remaining) parts.push(underThousand(remaining));
  return `${parts.join(" ")} rupees only`;
}

function invoiceModel(booking, invoice, settings) {
  const source = invoice?.invoice_data || invoice || {};
  const billing = source.billing || booking?.billing || {};
  const defaultLine = booking ? [{ description: booking.package?.title || "Travel services", travellerDetails: (booking.travellers || []).map((item) => item.full_name).filter(Boolean).join(", "), quantity: 1, rate: Number(booking.subtotal || booking.total || 0), amount: Number(booking.subtotal || booking.total || 0) }] : [];
  const lineItems = Array.isArray(source.lineItems) && source.lineItems.length ? source.lineItems : defaultLine;
  const charges = source.charges || {};
  const subtotal = present(source.subtotal) ? Number(source.subtotal) : lineItems.reduce((sum, item) => sum + Number(item.amount ?? Number(item.quantity || 0) * Number(item.rate || 0)), 0);
  const additions = Number(charges.convenienceFee || 0) + Number(charges.serviceFee || 0) + Number(charges.managementFee || 0) + Number(charges.tax || 0) + Number(charges.tds || 0) + Number(charges.adjustments || 0);
  const total = present(source.netAmount) ? Number(source.netAmount) : subtotal + additions - Number(charges.discount || 0);
  const paid = present(source.paid) ? Number(source.paid) : Number(booking?.amount_paid || 0);
  const invoiceNumber = safeReference(invoice?.invoice_number || source.invoiceNumber || `INV-${String(booking?.reference || Date.now()).replace("NTB-", "")}`);
  return {
    type: "invoice",
    title: "INVOICE",
    subtitle: `Invoice ${invoiceNumber}`,
    reference: safeReference(booking?.reference || source.bookingReference || invoiceNumber),
    filenameBase: `NAYSTRIP-Invoice-${invoiceNumber}`,
    status: invoice?.status || source.status || "draft",
    meta: rows([["Invoice number", invoiceNumber], ["Invoice date", date(invoice?.invoice_date || source.invoiceDate || new Date())], ["Booking reference", booking?.reference || source.bookingReference]]),
    sections: [
      { heading: "Issued by", rows: rows([["Business", settings.businessLegalName || settings.brandName], ["Address", settings.invoiceAddress || settings.address], ["GSTIN", settings.gstNumber]]) },
      { heading: "Bill to", rows: rows([["Customer / company", billing.companyName || billing.name], ["Address", [billing.address, billing.city, billing.state, billing.postal_code || billing.postalCode].filter(Boolean).join(", ")], ["Email", billing.email], ["Phone", billing.phone], ["GSTIN", billing.gstNumber || booking?.gst_details?.gst_number]]) },
      { heading: "Service details", table: { headers: ["Description", "Traveller / service details", "Qty", "Rate", "Amount"], rows: lineItems.map((item) => [text(item.description), text(item.travellerDetails || item.details), text(item.quantity || 1), money(item.rate), money(item.amount ?? Number(item.quantity || 0) * Number(item.rate || 0))]) } },
      { heading: "Amount calculation", rows: rows([["Subtotal", money(subtotal)], ["Convenience fee", money(charges.convenienceFee)], ["Service fee", money(charges.serviceFee)], ["Management fee", money(charges.managementFee)], ["Discount", Number(charges.discount) ? `- ${money(charges.discount)}` : ""], [settings.gstNumber ? "Tax / GST" : "Tax", money(charges.tax)], ["TDS", money(charges.tds)], ["Adjustments", money(charges.adjustments)], ["Paid", money(paid)], ["Balance", money(Math.max(0, total - paid))], ["NET AMOUNT", money(total)], ["Amount in words", source.amountInWords || amountInWords(total)]]) },
      ...(list(source.notes).length ? [{ heading: "Notes", bullets: list(source.notes) }] : []),
    ],
    summary: { total, paid, balance: Math.max(0, total - paid), customerName: billing.companyName || billing.name, invoiceNumber },
  };
}

function hotelModel(booking) {
  const details = booking.document_details?.hotel_voucher || {};
  const policySections = [["Cancellation Policy", details.cancellationPolicy], ["Check-in Instructions", details.checkInInstructions], ["Important Information", details.importantInformation], ["Other Information", details.otherInformation], ["Hotel Booking Policy", details.bookingPolicy], ["No-show", details.noShowPolicy], ["Amendments", details.amendmentPolicy], ["Refund Information", details.refundInformation]];
  const guests = list(details.guestNames).length ? list(details.guestNames) : (booking.travellers || []).map((item) => item.full_name || [item.first_name, item.last_name].filter(Boolean).join(" ")).filter(Boolean);
  const fareParts = [["Base amount", details.baseAmount ?? booking.subtotal], ["Taxes / charges", details.taxes ?? booking.tax], ["Service charges", details.serviceCharges]].filter(([, value]) => present(value));
  const calculatedTotal = fareParts.length ? fareParts.reduce((sum, [, value]) => sum + Number(value || 0), 0) : Number(details.total ?? booking.total ?? 0);
  const reference = safeReference(booking.reference);
  return {
    type: "hotel_voucher", title: "HOTEL BOOKING VOUCHER", subtitle: details.hotelName || booking.package?.title || "Hotel accommodation", reference,
    filenameBase: `NAYSTRIP-Hotel-Voucher-${reference}`,
    metaLayout: "compact", meta: rows([["Voucher number", details.voucherNumber || reference], ["Reference ID", booking.reference], ["Booking status", booking.operational_status]]),
    sections: [
      { heading: "Hotel Details", rows: rows([["Hotel name", details.hotelName], ["Address", details.hotelAddress], ["Rating", details.rating]]) },
      { heading: "Booking Details", layout: "grid", rows: rows([["Check-in date", date(details.checkIn || booking.travel_date)], ["Check-in time", details.checkInTime], ["Check-out date", date(details.checkOut || booking.end_date)], ["Check-out time", details.checkOutTime], ["Duration", details.duration || (booking.package?.days ? `${booking.package.days} days / ${booking.package.nights || 0} nights` : "")], ["Accommodation type", details.accommodationType || booking.hotel_category], ["Rooms", details.rooms || booking.room_count], ["Guests", details.guests || booking.traveller_count]]) },
      { heading: "Staying Guest Details", table: { widths: [1300, 1250, 2800, 4010], headers: ["Room type", "Staying guests", "Guest name(s)", "Inclusions / policy"], rows: (guests.length ? guests : [""]).map((guest, index) => [index === 0 ? details.roomType || booking.hotel_category : "", index === 0 ? String(details.guests || booking.traveller_count || guests.length || "") : "", guest, index === 0 ? details.inclusions || "" : ""]) } },
      { heading: "Fare Details", layout: "fare", rows: [...fareParts.map(([label, value]) => ({ label, value: money(value) })), { label: "Total", value: money(calculatedTotal) }] },
      ...policySections.filter(([, value]) => present(value)).map(([heading, value]) => ({ heading, bullets: list(value) })),
    ], summary: { customerName: booking.billing?.name, hotelName: details.hotelName || booking.package?.title, checkIn: date(details.checkIn || booking.travel_date), checkOut: date(details.checkOut || booking.end_date), status: booking.operational_status },
  };
}

function transportModel(booking) {
  const details = booking.document_details?.transport_voucher || {};
  const reference = safeReference(booking.reference);
  const itinerary = Array.isArray(details.itinerary) && details.itinerary.length ? details.itinerary : (booking.package?.itinerary || []).map((item) => ({ day: item.day_number || item.day, title: item.title, details: item.description || item.details }));
  return {
    type: "transport_voucher", title: "TRANSPORT BOOKING VOUCHER", subtitle: details.route || booking.package?.title || "Transport service", reference,
    filenameBase: `NAYSTRIP-Transport-Voucher-${reference}`,
    meta: rows([["Voucher number", details.voucherNumber || reference], ["Booking reference", booking.reference], ["Booking status", booking.operational_status]]),
    sections: [
      { heading: "Passenger & Journey", rows: rows([["Passenger", details.passengerName || booking.billing?.name], ["Travel date", date(details.travelDate || booking.travel_date)], ["Total days / nights", details.duration || (booking.package?.days ? `${booking.package.days} days / ${booking.package.nights || 0} nights` : "")], ["Total KM", details.totalKm], ["Vehicle", details.vehicleType], ["Pickup", details.pickup || booking.pickup_preference || booking.package?.start_point], ["Drop", details.drop || booking.package?.end_point], ["Route", details.route]]) },
      ...(itinerary.length ? [{ heading: "Day-wise Itinerary", table: { headers: ["Day", "Plan", "Details"], rows: itinerary.map((item, index) => [text(item.day || index + 1), text(item.title), text(item.details || item.description)]) } }] : []),
      ...(list(details.sightseeing).length ? [{ heading: "Sightseeing / Add-ons", bullets: list(details.sightseeing) }] : []),
      ...(list(details.inclusions).length ? [{ heading: "Inclusions", bullets: list(details.inclusions) }] : []),
      ...(list(details.exclusions).length ? [{ heading: "Exclusions", bullets: list(details.exclusions) }] : []),
      ...(list(details.rules).length ? [{ heading: "Toll, Parking & Driver Rules", bullets: list(details.rules) }] : []),
      { heading: "Fare", rows: rows([["Total amount", money(details.totalAmount ?? booking.total)]]) },
    ], summary: { customerName: details.passengerName || booking.billing?.name, route: details.route || [details.pickup, details.drop].filter(Boolean).join(" to "), travelDate: date(details.travelDate || booking.travel_date), vehicle: details.vehicleType },
  };
}

function itineraryModel(booking) {
  const reference = safeReference(booking.reference);
  const itinerary = booking.package?.itinerary || booking.itinerary || [];
  return { type: "itinerary", title: "DETAILED ITINERARY", subtitle: booking.package?.title || "Travel itinerary", reference, filenameBase: `NAYSTRIP-Itinerary-${reference}`, meta: rows([["Booking reference", booking.reference], ["Travel dates", [date(booking.travel_date), date(booking.end_date)].filter(Boolean).join(" to ")], ["Travellers", booking.traveller_count]]), sections: itinerary.map((item, index) => ({ heading: `Day ${item.day_number || item.day || index + 1}: ${item.title || "Itinerary"}`, text: item.description || item.details, rows: rows([["Meals", item.meals], ["Stay", item.stay], ["Transfers", item.transfers], ["Activities", Array.isArray(item.activities) ? item.activities.join(", ") : item.activities]]) })) };
}

export function buildDocumentModel(booking, type, { invoice = null, settings = defaultSiteSettings } = {}) {
  if (type === "invoice") return invoiceModel(booking, invoice, settings);
  if (!booking) throw new Error("A booking is required for this document type");
  if (type === "hotel_voucher") return hotelModel(booking);
  if (type === "transport_voucher") return transportModel(booking);
  if (type === "itinerary") return itineraryModel(booking);
  throw new Error("Unsupported document type");
}
