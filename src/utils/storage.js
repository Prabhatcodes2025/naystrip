const API_TIMEOUT = 12000;
function inquiryId(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
async function postLead(kind, payload) {
  const localId = inquiryId(kind === "custom_trip" ? "TRIP" : "CTC");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const captchaToken = await turnstileToken();
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        payload,
        clientReference: localId,
        website: "naystrip.com",
        captchaToken,
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        data.error ||
          "Enquiry service is temporarily unavailable. Please call or WhatsApp us.",
      );
    return { id: data.id || localId };
  } finally {
    clearTimeout(timer);
  }
}
let turnstileLoader;
function turnstileToken() {
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!sitekey) return Promise.resolve(null);
  if (!turnstileLoader)
    turnstileLoader = new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Anti-bot check could not load"));
      document.head.appendChild(script);
    });
  return turnstileLoader.then(
    () =>
      new Promise((resolve, reject) => {
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(container);
        const widget = window.turnstile.render(container, {
          sitekey,
          size: "invisible",
          execution: "execute",
          callback: (token) => {
            window.turnstile.remove(widget);
            container.remove();
            resolve(token);
          },
          "error-callback": () => {
            window.turnstile.remove(widget);
            container.remove();
            reject(new Error("Anti-bot check failed"));
          },
        });
        window.turnstile.execute(widget);
      }),
  );
}
export const saveCustomLead = (lead) => postLead("custom_trip", lead);
export const saveContactLead = (lead) => postLead("contact", lead);

const AUTH_KEY = "naystrip_admin_session";
export function isAdminLoggedIn() {
  try {
    return Boolean(sessionStorage.getItem(AUTH_KEY));
  } catch {
    return false;
  }
}
export async function adminLogin(email, password) {
  const response = await fetch("/api/auth/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return false;
  sessionStorage.setItem(AUTH_KEY, data.access_token);
  return true;
}
export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}
async function adminRequest(path, options = {}) {
  const token = sessionStorage.getItem(AUTH_KEY);
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Admin request failed");
  return data;
}
export const getCustomLeads = async () => {
  const data = await adminRequest("/api/admin/leads?kind=custom_trip");
  return data.leads;
};
export const getContactLeads = async () => {
  const data = await adminRequest("/api/admin/leads?kind=contact");
  return data.leads;
};
export const updateCustomLeadStatus = (
  id,
  status,
  note = "",
  followUpAt = null,
) =>
  adminRequest("/api/admin/leads", {
    method: "PATCH",
    body: JSON.stringify({ id, status, note, followUpAt }),
  });
export const deleteCustomLead = (id) =>
  updateCustomLeadStatus(id, "closed", "Archived from lead queue");
export const updateContactLeadStatus = updateCustomLeadStatus;
export const deleteContactLead = deleteCustomLead;
export const getAdminTours = () => [];
export const getAdminBlogs = () => [];
export const getAdminStories = () => [];
export const saveAdminTour = () => {
  throw new Error("Connect the admin data service");
};
export const deleteAdminTour = () => {};
export const saveAdminBlog = () => {
  throw new Error("Connect the admin data service");
};
export const deleteAdminBlog = () => {};
export const saveAdminStory = () => {
  throw new Error("Connect the admin data service");
};
export const deleteAdminStory = () => {};
export const KEYS = {};
