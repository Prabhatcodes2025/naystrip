import { cancellationSlabs } from "./tours";
import { defaultSiteSettings } from "./siteConfig";

const contact = `${defaultSiteSettings.email} · ${defaultSiteSettings.phone} · ${defaultSiteSettings.address}`;

export const policyPages = {
  privacy: {
    title: "Privacy Policy",
    updated: "13 August 2026",
    intro: "This policy explains how MI24 Securetech LLP, operating NaysTrip & Treks, collects, uses and protects information when you enquire, book or use this website.",
    sections: [
      ["Information we collect", ["Identity and contact details, traveller information, trip preferences, support messages, booking records and information required by travel suppliers.", "Payment card or bank credentials are handled by the payment gateway. We do not store complete card or banking credentials on our servers."]],
      ["How we use information", ["To prepare quotations, process bookings and payments, coordinate suppliers, provide travel documents, send service updates, prevent fraud and meet legal obligations.", "We use marketing communications only where permitted and you can opt out at any time."]],
      ["Sharing and retention", ["Information is shared only as needed with hotels, transport operators, guides, insurers, payment processors, technology providers and authorities involved in delivering or regulating your trip.", "Records are kept only as long as needed for service, accounting, dispute and legal requirements, then securely deleted or anonymised."]],
      ["Your choices and security", ["You may request access, correction or deletion where applicable. We use reasonable technical and organisational controls, but no internet transmission is completely risk-free."]],
      ["Contact", [`Privacy requests may be sent to ${contact}.`]],
    ],
  },
  terms: {
    title: "Terms and Conditions",
    updated: "13 August 2026",
    intro: "These terms govern enquiries and bookings made with MI24 Securetech LLP, operating NaysTrip & Treks. The final quotation and confirmed itinerary form part of your booking contract.",
    sections: [
      ["Quotation and booking", ["Website prices marked ‘from’ are approved starting prices and may change with dates, occupancy, availability, supplier charges and selected services. ‘Price on request’ means no online price has been approved.", "A booking is confirmed only after we issue confirmation and receive the payment stated in your quotation. Availability is not held until then."]],
      ["Traveller responsibility", ["Travellers must provide accurate names, dates of birth, identification and contact details, and hold valid documents, permits and visas. Health, fitness and insurance requirements remain the traveller’s responsibility unless expressly included."]],
      ["Changes and force majeure", ["Routes, timings, activities and suppliers may change because of weather, safety, transport disruption, government action or events beyond reasonable control. We will offer a practical alternative where possible."]],
      ["Payment, cancellation and refunds", ["Payment due dates are stated in the quotation or checkout. Cancellation charges follow the published Cancellation Policy and any stricter supplier terms disclosed before booking. Approved refunds are returned to the original payment method where possible."]],
      ["Law and contact", [`These terms are governed by Indian law and disputes are subject to Navi Mumbai, Maharashtra jurisdiction. Contact: ${contact}.`]],
    ],
  },
  cancellation: {
    title: "Cancellation Policy",
    updated: "13 August 2026",
    intro: "Cancellation must be requested in writing from the booking’s registered email address. Charges are calculated from the scheduled trip start date and apply to the total booking value unless the confirmed quotation states stricter, disclosed supplier terms.",
    sections: [
      ["How to cancel", [`Email ${defaultSiteSettings.cancellationEmail} with the booking reference, lead traveller name and reason. A request is effective only when acknowledged by our team.`]],
      ["Cancellation charges", cancellationSlabs.map((slab) => `${slab.from}–${slab.to} days before departure: ${slab.fee}% of the total booking value.`)],
      ["Non-refundable items", ["Issued air or rail tickets, visas, permits, insurance, event tickets and supplier deposits may be non-refundable where disclosed. No-show and cancellation 0–5 days before departure carry a 100% charge."]],
      ["Changes by NaysTrip", ["If we cancel a service and cannot provide a reasonable alternative, the recoverable amount for that service will be refunded. Events beyond reasonable control are handled according to supplier recoveries and applicable law."]],
    ],
  },
  refund: {
    title: "Refund Policy",
    updated: "13 August 2026",
    intro: "Refund eligibility depends on the confirmed booking terms, cancellation date, services already delivered and amounts recoverable from travel suppliers.",
    sections: [
      ["Refund process", ["After a cancellation is acknowledged, we calculate applicable charges and supplier deductions. We will share the refund calculation and request any information required by the payment provider.", "Approved refunds are initiated to the original payment method where possible. Banking and gateway processing may take 7–14 business days after approval; supplier-dependent refunds can take longer and we will provide updates."]],
      ["Payment failures and duplicate charges", [`For a failed transaction or suspected duplicate charge, email ${defaultSiteSettings.email} with the booking reference and payment transaction ID. Do not share card PINs, passwords or OTPs.`]],
      ["Non-refundable amounts", ["Convenience fees, issued tickets, permits, visas, insurance and non-recoverable supplier deposits may be excluded where disclosed before booking. Refunds are not issued for unused services after travel begins unless required by law."]],
    ],
  },
  payment: {
    title: "Payment Policy",
    updated: "13 August 2026",
    intro: "Online payments are offered only for published packages with approved pricing and valid availability. Other trips begin with an enquiry and written quotation.",
    sections: [
      ["Payment methods", ["Available payment methods are displayed securely by Cashfree Payment Gateway at checkout. Cashfree processes payment credentials; NaysTrip does not store complete card or banking credentials.", "An order is not treated as paid until server-side verification confirms a successful payment. A browser success screen alone is not confirmation."]],
      ["Amounts and receipts", ["The checkout shows the booking amount, tax and payable advance or total before payment. Payment confirmation and booking documents are issued after successful verification."]],
      ["Payment unavailable", [`If online payment is temporarily unavailable, no charge is attempted. Your saved booking reference remains available and you may contact ${defaultSiteSettings.email} or ${defaultSiteSettings.phone} for assistance.`]],
    ],
  },
};
