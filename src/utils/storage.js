const API_TIMEOUT = 12000;
function inquiryId(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
async function postLead(kind, payload) {
  const prefixes = { custom_trip: "TRIP", package_quote: "PKG", quick_quote: "QTE", contact: "CTC" };
  const localId = inquiryId(prefixes[kind] || "LEAD");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const captchaToken = await getTurnstileToken();
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
let turnstileConfiguration;
async function configuredTurnstile() {
  if (!turnstileConfiguration)
    turnstileConfiguration = fetch("/api/config", {
      headers: { Accept: "application/json" },
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error("Anti-bot configuration is unavailable");
      return data.turnstile || { enabled: false, siteKey: null };
    });
  return turnstileConfiguration;
}
export async function getTurnstileToken() {
  const configuration = await configuredTurnstile();
  if (!configuration.enabled || !configuration.siteKey) return null;
  const sitekey = configuration.siteKey;
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
export const savePackageLead = (lead) => postLead("package_quote", lead);
export const saveQuickLead = (lead) => postLead("quick_quote", lead);

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
export const getPackageLeads = async () => {
  const data = await adminRequest("/api/admin/leads?kind=package_quote");
  return data.leads;
};
export const getQuickLeads = async () => {
  const data = await adminRequest("/api/admin/leads?kind=quick_quote");
  return data.leads || [];
};
export const getB2BLeads = async () => {
  const data = await adminRequest("/api/admin/leads?kind=b2b_enquiry");
  return data.leads || [];
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
export const getAdminBlogs = async () => (await adminRequest("/api/admin/content?resource=blogs")).items;
export const getAdminStories = async () => (await adminRequest("/api/admin/content?resource=stories")).items;
export const saveAdminTour = () => {
  throw new Error("Connect the admin data service");
};
export const deleteAdminTour = () => {};
export const saveAdminBlog = (item) => adminRequest("/api/admin/content?resource=blogs",{method:item.id?"PATCH":"POST",body:JSON.stringify({resource:"blogs",item})});
export const deleteAdminBlog = (id) => adminRequest(`/api/admin/content?resource=blogs&id=${encodeURIComponent(id)}`,{method:"DELETE"});
export const saveAdminStory = (item) => adminRequest("/api/admin/content?resource=stories",{method:item.id?"PATCH":"POST",body:JSON.stringify({resource:"stories",item})});
export const deleteAdminStory = (id) => adminRequest(`/api/admin/content?resource=stories&id=${encodeURIComponent(id)}`,{method:"DELETE"});
export const getPublicBlogs = async () => {const response=await fetch("/api/content?resource=blogs");const data=await response.json();if(!response.ok)throw new Error(data.error);return data.blogs||[]};
export const getPublicStories = async () => {const response=await fetch("/api/content?resource=stories");const data=await response.json();if(!response.ok)throw new Error(data.error);return data.stories||[]};
export const KEYS = {};
