const VERSION = 1;
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const keyFor = (slug) => `naystrip_checkout_draft_v${VERSION}_${encodeURIComponent(slug || "trip")}`;

export function readCheckoutDraft(slug) {
  try {
    const raw = sessionStorage.getItem(keyFor(slug));
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (draft?.version !== VERSION || draft?.slug !== slug || !draft?.form || Date.now() - Number(draft.savedAt) > MAX_AGE_MS) {
      sessionStorage.removeItem(keyFor(slug));
      return null;
    }
    return { form: draft.form, pricing: draft.pricing || null, step: Math.min(4, Math.max(1, Number(draft.step) || 1)) };
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(slug, { form, pricing, step }) {
  try {
    sessionStorage.setItem(keyFor(slug), JSON.stringify({ version: VERSION, slug, form, pricing: pricing || null, step: Math.min(4, Math.max(1, Number(step) || 1)), savedAt: Date.now() }));
  } catch {
    // Checkout remains usable when storage is unavailable or full.
  }
}

export function clearCheckoutDraft(slug) {
  try { sessionStorage.removeItem(keyFor(slug)); } catch { /* no-op */ }
}
