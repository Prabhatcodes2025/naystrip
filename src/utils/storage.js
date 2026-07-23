// Lightweight localStorage-backed data layer for the demo admin dashboard.

const KEYS = {
  CUSTOM_LEADS: "altiora_custom_leads",
  CONTACT_LEADS: "altiora_contact_leads",
  ADMIN_TOURS: "altiora_admin_tours",
  ADMIN_BLOGS: "altiora_admin_blogs",
  ADMIN_STORIES: "altiora_admin_stories",
  ADMIN_AUTH: "altiora_admin_auth",
};

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function generateInquiryId(prefix = "ALT") {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const ts = Date.now().toString().slice(-6);
  return `${prefix}-${ts}${rand}`;
}

// ---- Custom Trip Leads ----
export function saveCustomLead(lead) {
  const list = readList(KEYS.CUSTOM_LEADS);
  const entry = {
    id: generateInquiryId("TRIP"),
    status: "New",
    submittedAt: new Date().toISOString(),
    ...lead,
  };
  list.unshift(entry);
  writeList(KEYS.CUSTOM_LEADS, list);
  return entry;
}
export function getCustomLeads() {
  return readList(KEYS.CUSTOM_LEADS);
}
export function updateCustomLeadStatus(id, status) {
  const list = readList(KEYS.CUSTOM_LEADS).map((l) => (l.id === id ? { ...l, status } : l));
  writeList(KEYS.CUSTOM_LEADS, list);
}
export function deleteCustomLead(id) {
  writeList(KEYS.CUSTOM_LEADS, readList(KEYS.CUSTOM_LEADS).filter((l) => l.id !== id));
}

// ---- Contact Leads ----
export function saveContactLead(lead) {
  const list = readList(KEYS.CONTACT_LEADS);
  const entry = {
    id: generateInquiryId("CTC"),
    status: "New",
    submittedAt: new Date().toISOString(),
    ...lead,
  };
  list.unshift(entry);
  writeList(KEYS.CONTACT_LEADS, list);
  return entry;
}
export function getContactLeads() {
  return readList(KEYS.CONTACT_LEADS);
}
export function updateContactLeadStatus(id, status) {
  const list = readList(KEYS.CONTACT_LEADS).map((l) => (l.id === id ? { ...l, status } : l));
  writeList(KEYS.CONTACT_LEADS, list);
}
export function deleteContactLead(id) {
  writeList(KEYS.CONTACT_LEADS, readList(KEYS.CONTACT_LEADS).filter((l) => l.id !== id));
}

// ---- Admin-managed Tours (additions on top of static catalogue) ----
export function getAdminTours() {
  return readList(KEYS.ADMIN_TOURS);
}
export function saveAdminTour(tour) {
  const list = readList(KEYS.ADMIN_TOURS);
  if (tour.id) {
    const idx = list.findIndex((t) => t.id === tour.id);
    if (idx > -1) {
      list[idx] = tour;
      writeList(KEYS.ADMIN_TOURS, list);
      return tour;
    }
  }
  const entry = { ...tour, id: `AT-${Date.now()}`, createdAt: new Date().toISOString() };
  list.unshift(entry);
  writeList(KEYS.ADMIN_TOURS, list);
  return entry;
}
export function deleteAdminTour(id) {
  writeList(KEYS.ADMIN_TOURS, readList(KEYS.ADMIN_TOURS).filter((t) => t.id !== id));
}

// ---- Admin-managed Blogs ----
export function getAdminBlogs() {
  return readList(KEYS.ADMIN_BLOGS);
}
export function saveAdminBlog(blog) {
  const list = readList(KEYS.ADMIN_BLOGS);
  if (blog.id) {
    const idx = list.findIndex((b) => b.id === blog.id);
    if (idx > -1) {
      list[idx] = blog;
      writeList(KEYS.ADMIN_BLOGS, list);
      return blog;
    }
  }
  const entry = { ...blog, id: `AB-${Date.now()}`, createdAt: new Date().toISOString() };
  list.unshift(entry);
  writeList(KEYS.ADMIN_BLOGS, list);
  return entry;
}
export function deleteAdminBlog(id) {
  writeList(KEYS.ADMIN_BLOGS, readList(KEYS.ADMIN_BLOGS).filter((b) => b.id !== id));
}

// ---- Admin-managed Traveller Stories ----
export function getAdminStories() {
  return readList(KEYS.ADMIN_STORIES);
}
export function saveAdminStory(story) {
  const list = readList(KEYS.ADMIN_STORIES);
  if (story.id) {
    const idx = list.findIndex((s) => s.id === story.id);
    if (idx > -1) {
      list[idx] = story;
      writeList(KEYS.ADMIN_STORIES, list);
      return story;
    }
  }
  const entry = { ...story, id: `AS-${Date.now()}`, createdAt: new Date().toISOString() };
  list.unshift(entry);
  writeList(KEYS.ADMIN_STORIES, list);
  return entry;
}
export function deleteAdminStory(id) {
  writeList(KEYS.ADMIN_STORIES, readList(KEYS.ADMIN_STORIES).filter((s) => s.id !== id));
}

// ---- Admin Auth ----
export function isAdminLoggedIn() {
  return sessionStorage.getItem(KEYS.ADMIN_AUTH) === "true" || localStorage.getItem(KEYS.ADMIN_AUTH) === "true";
}
export function adminLogin(email, password, remember) {
  if (email === "admin@travel.com" && password === "admin123") {
    if (remember) localStorage.setItem(KEYS.ADMIN_AUTH, "true");
    else sessionStorage.setItem(KEYS.ADMIN_AUTH, "true");
    return true;
  }
  return false;
}
export function adminLogout() {
  sessionStorage.removeItem(KEYS.ADMIN_AUTH);
  localStorage.removeItem(KEYS.ADMIN_AUTH);
}

export { KEYS };
