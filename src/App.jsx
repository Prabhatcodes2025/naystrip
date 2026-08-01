import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";

const Home = lazy(() => import("./pages/Home"));
const ToursListing = lazy(() => import("./pages/ToursListing"));
const TourDetails = lazy(() => import("./pages/TourDetails"));
const DestinationsListing = lazy(() => import("./pages/DestinationsListing"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const Holidays = lazy(() => import("./pages/Holidays"));
const FixedDepartures = lazy(() => import("./pages/FixedDepartures"));
const Treks = lazy(() => import("./pages/TreksExpeditionsListing").then((m) => ({ default: m.Treks })));
const Expeditions = lazy(() => import("./pages/TreksExpeditionsListing").then((m) => ({ default: m.Expeditions })));
const TrekDetail = lazy(() => import("./pages/TrekDetail"));
const Transport = lazy(() => import("./pages/Transport"));
const CustomTrip = lazy(() => import("./pages/CustomTrip"));
const CorporateTravel = lazy(() => import("./pages/CorporateTravel"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PortalAccess = lazy(() => import("./pages/PortalAccess"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTours = lazy(() => import("./pages/admin/AdminTours"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminContactLeads = lazy(() => import("./pages/admin/AdminContactLeads"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminStories = lazy(() => import("./pages/admin/AdminStories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta-300 border-t-terracotta-500" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<ToursListing />} />
        <Route path="/tours/:slug" element={<TourDetails />} />
        <Route path="/destinations" element={<DestinationsListing />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/fixed-departures" element={<FixedDepartures />} />
        <Route path="/treks" element={<Treks />} />
        <Route path="/treks/:slug" element={<TrekDetail />} />
        <Route path="/expeditions" element={<Expeditions />} />
        <Route path="/expeditions/:slug" element={<TrekDetail />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/custom-trip" element={<CustomTrip />} />
        <Route path="/corporate-travel" element={<CorporateTravel />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<StaticPage slug="about" />} />
        <Route path="/careers" element={<StaticPage slug="careers" />} />
        <Route path="/terms" element={<StaticPage slug="terms" />} />
        <Route path="/privacy" element={<StaticPage slug="privacy" />} />
        <Route path="/disclaimer" element={<StaticPage slug="disclaimer" />} />
        <Route path="/faqs" element={<StaticPage slug="faqs" />} />
        <Route path="/sitemap" element={<StaticPage slug="sitemap" />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/account/login" element={<PortalAccess />} />
      <Route path="/account/register" element={<PortalAccess />} />
      <Route path="/b2b/login" element={<PortalAccess />} />
      <Route path="/b2b/register" element={<PortalAccess />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="contact-leads" element={<AdminContactLeads />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="stories" element={<AdminStories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
