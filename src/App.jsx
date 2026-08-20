import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import { GlobalPreloader, PageLoader } from "./components/shared/Loading";
import RouteErrorBoundary from "./components/shared/RouteErrorBoundary";
import AdminErrorBoundary from "./components/admin/AdminErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const ToursListing = lazy(() => import("./pages/ToursListing"));
const TourCategoryPage = lazy(() => import("./pages/TourCategoryPage"));
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
const PasswordRecovery = lazy(() => import("./pages/PasswordRecovery"));
const BookingCheckout = lazy(() => import("./pages/BookingCheckout"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const BookingVerify = lazy(() => import("./pages/BookingVerify"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const B2BDashboard = lazy(() => import("./pages/B2BDashboard"));
const QuotationView = lazy(() => import("./pages/QuotationView"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTours = lazy(() => import("./pages/admin/AdminTours"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminContactLeads = lazy(() => import("./pages/admin/AdminContactLeads"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminStories = lazy(() => import("./pages/admin/AdminStories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminQuotations = lazy(() => import("./pages/admin/AdminQuotations"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminDepartures = lazy(() => import("./pages/admin/AdminDepartures"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminAgents = lazy(() => import("./pages/admin/AdminAgents"));

function BootComplete({ onReady }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const completeBoot = useCallback(() => setBooting(false), []);
  return (
    <RouteErrorBoundary><Suspense fallback={booting ? <GlobalPreloader /> : <PageLoader />}><BootComplete onReady={completeBoot} />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<ToursListing />} />
        <Route path="/tours/domestic" element={<TourCategoryPage kind="domestic" />} />
        <Route path="/tours/international" element={<TourCategoryPage kind="international" />} />
        <Route path="/tours/:slug" element={<TourDetails />} />
        <Route path="/trips/:slug" element={<TourDetails shareable />} />
        <Route path="/destinations" element={<DestinationsListing />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/fixed-departures" element={<FixedDepartures />} />
        <Route path="/treks" element={<Treks />} />
        <Route path="/treks-expeditions" element={<Treks />} />
        <Route path="/treks/:slug" element={<TrekDetail />} />
        <Route path="/expeditions" element={<Expeditions />} />
        <Route path="/expeditions/:slug" element={<TrekDetail />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/custom-trip" element={<CustomTrip />} />
        <Route path="/checkout/:slug" element={<BookingCheckout />} />
        <Route path="/corporate-travel" element={<CorporateTravel />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<StaticPage slug="about" />} />
        <Route path="/careers" element={<StaticPage slug="careers" />} />
        <Route path="/terms" element={<StaticPage slug="terms" />} />
        <Route path="/terms-and-conditions" element={<StaticPage slug="terms" />} />
        <Route path="/user-agreement" element={<StaticPage slug="terms" />} />
        <Route path="/privacy" element={<StaticPage slug="privacy" />} />
        <Route path="/privacy-policy" element={<StaticPage slug="privacy" />} />
        <Route path="/refund-policy" element={<StaticPage slug="refund" />} />
        <Route path="/cancellation-policy" element={<StaticPage slug="cancellation" />} />
        <Route path="/payment-policy" element={<StaticPage slug="payment" />} />
        <Route path="/disclaimer" element={<StaticPage slug="disclaimer" />} />
        <Route path="/faqs" element={<StaticPage slug="faqs" />} />
        <Route path="/sitemap" element={<StaticPage slug="sitemap" />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/account/login" element={<PortalAccess />} />
      <Route path="/account/register" element={<PortalAccess />} />
      <Route path="/account/forgot-password" element={<PasswordRecovery />} />
      <Route path="/account/reset-password" element={<PasswordRecovery />} />
      <Route path="/account/dashboard" element={<CustomerDashboard />} />
      <Route path="/b2b/login" element={<PortalAccess />} />
      <Route path="/b2b/register" element={<PortalAccess />} />
      <Route path="/b2b/forgot-password" element={<PasswordRecovery />} />
      <Route path="/b2b/reset-password" element={<PasswordRecovery />} />
      <Route path="/b2b/dashboard" element={<B2BDashboard />} />
      <Route path="/booking/confirmation/:reference" element={<BookingConfirmation />} />
      <Route path="/booking/verify/:reference" element={<BookingVerify />} />
      <Route path="/quotation/:reference" element={<QuotationView />} />
      <Route path="/admin" element={<AdminErrorBoundary><AdminLayout /></AdminErrorBoundary>}>
        <Route index element={<AdminDashboard />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="departures" element={<AdminDepartures />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="contact-leads" element={<AdminContactLeads />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="stories" element={<AdminStories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
    </Suspense></RouteErrorBoundary>
  );
}
