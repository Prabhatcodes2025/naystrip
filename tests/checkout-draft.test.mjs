import assert from "node:assert/strict";
import test from "node:test";
import { clearCheckoutDraft, readCheckoutDraft, saveCheckoutDraft } from "../src/utils/checkoutDraft.js";

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key), values };
}

test("checkout draft restores the exact safe form, pricing summary and active step", () => {
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = storage();
  try {
    const form = { departureId: "departure-1", travelDate: "2026-12-01", travellers: [{ fullName: "Test Traveller", idType: "Passport", idNumber: "P123" }], contact: { email: "test@example.com", phone: "9876543210" }, billing: { city: "Mumbai" } };
    const pricing = { pricing: { total: 12000 } };
    saveCheckoutDraft("sample-trip", { form, pricing, step: 4 });
    assert.deepEqual(readCheckoutDraft("sample-trip"), { form, pricing, step: 4 });
    const raw = [...globalThis.sessionStorage.values.values()][0];
    assert.doesNotMatch(raw, /access_token|payment_session|card_number|cashfree/i);
    clearCheckoutDraft("sample-trip");
    assert.equal(readCheckoutDraft("sample-trip"), null);
  } finally { globalThis.sessionStorage = previous; }
});

test("checkout drafts are isolated by trip slug", () => {
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = storage();
  try {
    saveCheckoutDraft("trip-a", { form: { customerNotes: "A" }, pricing: null, step: 2 });
    assert.equal(readCheckoutDraft("trip-b"), null);
    assert.equal(readCheckoutDraft("trip-a").form.customerNotes, "A");
  } finally { globalThis.sessionStorage = previous; }
});
