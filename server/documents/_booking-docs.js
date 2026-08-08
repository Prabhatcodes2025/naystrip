import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
const C = {
  navy: rgb(35 / 255, 59 / 255, 79 / 255),
  orange: rgb(244 / 255, 92 / 255, 15 / 255),
  forest: rgb(23 / 255, 60 / 255, 52 / 255),
  grey: rgb(0.35, 0.39, 0.43),
  pale: rgb(1, 0.98, 0.95),
};
const wrap = (font, text, size, width) => {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
};
export async function bookingDocument(booking, type = "voucher") {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let logo;
  try {
    logo = await pdf.embedPng(
      await readFile(
        join(process.cwd(), "public", "branding", "naystrip-logo.png"),
      ),
    );
  } catch {}
  let page, y;
  const addPage = () => {
    page = pdf.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
      color: C.pale,
    });
    page.drawRectangle({
      x: 0,
      y: 823,
      width: 595.28,
      height: 19,
      color: C.orange,
    });
    if (logo) {
      const scaled = logo.scaleToFit(104, 104);
      page.drawImage(logo, {
        x: 40,
        y: 704,
        width: scaled.width,
        height: scaled.height,
      });
    }
    page.drawText("NAYSTRIP & TREKS", {
      x: 370,
      y: 790,
      size: 10,
      font: bold,
      color: C.forest,
    });
    page.drawText("Leisure to Adventure", {
      x: 370,
      y: 775,
      size: 8,
      font: regular,
      color: C.grey,
    });
    page.drawText("+91 8097132424 | hello@naystrip.com", {
      x: 370,
      y: 760,
      size: 7,
      font: regular,
      color: C.grey,
    });
    y = 690;
    return page;
  };
  const ensure = (space = 70) => {
    if (y < space) addPage();
  };
  const text = (
    value,
    {
      size = 9,
      font = regular,
      color = C.grey,
      x = 40,
      width = 515,
      leading = 14,
      gap = 4,
    } = {},
  ) => {
    for (const line of wrap(font, value, size, width)) {
      ensure();
      page.drawText(line, { x, y, size, font, color });
      y -= leading;
    }
    y -= gap;
  };
  const heading = (value) => {
    ensure(55);
    text(value, { size: 13, font: bold, color: C.orange, gap: 8 });
  };
  const field = (label, value) => {
    if (value != null && value !== "")
      text(`${label}: ${value}`, { size: 9, color: C.navy });
  };
  addPage();
  const titles = {
    voucher: "BOOKING VOUCHER / TRAVEL TICKET",
    invoice: "INVOICE",
    receipt: "PAYMENT RECEIPT",
    itinerary: "DETAILED ITINERARY",
  };
  text(titles[type] || titles.voucher, {
    size: 20,
    font: bold,
    color: C.forest,
  });
  text(`Reference ${booking.reference}`, {
    size: 10,
    font: bold,
    color: C.orange,
  });
  y -= 6;
  if (type === "voucher") {
    field("Ticket / voucher", booking.ticket_number || "Pending confirmation");
    field("Booking status", booking.operational_status);
    field("Payment status", booking.payment_state);
    field("Customer", booking.billing?.name);
    field("Package", booking.package?.title);
    field("Destination", (booking.package?.destination_names || []).join(", "));
    field(
      "Travel dates",
      [booking.travel_date, booking.end_date].filter(Boolean).join(" to "),
    );
    field(
      "Duration",
      `${booking.package?.days || "—"} days / ${booking.package?.nights || "—"} nights`,
    );
    field("Travellers", booking.traveller_count);
    field(
      "Pickup / start point",
      booking.pickup_preference ||
        booking.departure_city ||
        booking.package?.start_point,
    );
    heading("Travellers");
    for (const traveller of booking.travellers || [])
      field(
        traveller.traveller_type || "Traveller",
        traveller.full_name ||
          `${traveller.first_name} ${traveller.last_name || ""}`,
      );
    heading("Payment");
    field("Total", `INR ${Number(booking.total).toLocaleString("en-IN")}`);
    field(
      "Amount paid",
      `INR ${Number(booking.amount_paid).toLocaleString("en-IN")}`,
    );
    field(
      "Balance due",
      `INR ${Number(booking.balance_due).toLocaleString("en-IN")}`,
    );
    field("Transaction", booking.razorpay_payment_id || "Not available");
    heading("Important information");
    text(
      "Carry the original identity documents entered during booking. This voucher confirms NaysTrip tour services only and is not an airline or railway ticket. Supplier vouchers may be issued separately. Contact NaysTrip immediately if any detail is incorrect.",
    );
    const verifyUrl = `${process.env.PUBLIC_SITE_URL || "https://naystrip.vercel.app"}/booking/verify/${booking.reference}`;
    const qrData = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 220,
      color: { dark: "#173c34", light: "#fffaf2" },
    });
    const qr = await pdf.embedPng(Buffer.from(qrData.split(",")[1], "base64"));
    ensure(150);
    page.drawImage(qr, { x: 40, y: y - 110, width: 105, height: 105 });
    page.drawText("Scan to verify booking", {
      x: 160,
      y: y - 55,
      size: 10,
      font: bold,
      color: C.forest,
    });
    page.drawText(verifyUrl, {
      x: 160,
      y: y - 73,
      size: 7,
      font: regular,
      color: C.grey,
      maxWidth: 380,
    });
    y -= 125;
  }
  if (type === "invoice") {
    field("Invoice number", `INV-${booking.reference.replace("NTB-", "")}`);
    field("Invoice date", new Date().toISOString().slice(0, 10));
    field("Booking reference", booking.reference);
    heading("Bill to");
    field("Name", booking.billing?.name);
    field(
      "Address",
      [
        booking.billing?.address,
        booking.billing?.city,
        booking.billing?.state,
        booking.billing?.postal_code,
      ]
        .filter(Boolean)
        .join(", "),
    );
    if (booking.gst_details?.gst_number)
      field("GST number", booking.gst_details.gst_number);
    if (booking.gst_details?.company_name)
      field("Company", booking.gst_details.company_name);
    heading("Charges");
    field("Package", booking.package?.title);
    field(
      "Taxable subtotal",
      `INR ${Number(booking.subtotal).toLocaleString("en-IN")}`,
    );
    field(
      "Discount",
      `INR ${Number(booking.discount || 0).toLocaleString("en-IN")}`,
    );
    field("Tax / GST", `INR ${Number(booking.tax).toLocaleString("en-IN")}`);
    field(
      "Final amount",
      `INR ${Number(booking.total).toLocaleString("en-IN")}`,
    );
    field(
      "Amount paid",
      `INR ${Number(booking.amount_paid).toLocaleString("en-IN")}`,
    );
    field(
      "Balance",
      `INR ${Number(booking.balance_due).toLocaleString("en-IN")}`,
    );
    field("Payment reference", booking.razorpay_payment_id || "Pending");
    text(
      "GST registration and legal invoice fields are controlled from NaysTrip business settings and must be configured by the owner before issuing a tax invoice.",
      { size: 8, color: C.grey },
    );
  }
  if (type === "receipt") {
    field("Receipt number", `RCP-${booking.reference.replace("NTB-", "")}`);
    field("Booking reference", booking.reference);
    field("Customer", booking.billing?.name);
    field("Package", booking.package?.title);
    heading("Payments received");
    for (const payment of booking.payments || []) {
      if (payment.status === "successful")
        field(
          payment.captured_at || payment.created_at,
          `INR ${Number(payment.amount).toLocaleString("en-IN")} • ${payment.gateway_payment_id || payment.payment_method || payment.gateway}`,
        );
    }
    field(
      "Total paid",
      `INR ${Number(booking.amount_paid).toLocaleString("en-IN")}`,
    );
    field(
      "Balance due",
      `INR ${Number(booking.balance_due).toLocaleString("en-IN")}`,
    );
  }
  if (type === "itinerary") {
    field("Booking reference", booking.reference);
    field("Package", booking.package?.title);
    field(
      "Travel dates",
      [booking.travel_date, booking.end_date].filter(Boolean).join(" to "),
    );
    for (const item of booking.itinerary || []) {
      heading(`Day ${item.day_number || item.day}: ${item.title}`);
      text(item.description || item.details);
      if (item.meals) field("Meals", item.meals);
      if (item.stay) field("Stay", item.stay);
    }
  }
  const pages = pdf.getPages();
  for (let index = 0; index < pages.length; index++) {
    const p = pages[index];
    p.drawLine({
      start: { x: 40, y: 35 },
      end: { x: 555, y: 35 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    p.drawText(
      `NaysTrip & Treks | naystrip.com | Page ${index + 1} of ${pages.length}`,
      { x: 40, y: 20, size: 7, font: regular, color: C.grey },
    );
  }
  return Buffer.from(await pdf.save());
}
