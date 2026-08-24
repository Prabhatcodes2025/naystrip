import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Map, Users, MessageSquare, Newspaper, Star, Settings, FileText, CalendarDays, BellRing,
  Menu, X, Search, Bell, LogOut, Mail,
} from "lucide-react";
import { isAdminLoggedIn, adminLogout } from "../../utils/storage";
import BrandLogo from "../../components/branding/BrandLogo";
import { PageLoader } from "../../components/shared/Loading";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tours", label: "Tour Management", icon: Map },
  { to: "/admin/bookings", label: "Bookings", icon: FileText },
  { to: "/admin/vouchers", label: "Hotel & Taxi Vouchers", icon: FileText },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/departures", label: "Fixed Departures", icon: CalendarDays },
  { to: "/admin/leads", label: "Custom Trip Leads", icon: Users },
  { to: "/admin/contact-leads", label: "Contact Leads", icon: MessageSquare },
  { to: "/admin/package-leads", label: "Package / Quote Leads", icon: FileText },
  { to: "/admin/quotations", label: "Quotations", icon: FileText },
  { to: "/admin/notifications", label: "Notifications", icon: BellRing },
  { to: "/admin/subscribers", label: "Newsletter", icon: Mail },
  { to: "/admin/agents", label: "B2B Partner Approvals", icon: Users },
  { to: "/admin/blogs", label: "Blog Management", icon: Newspaper },
  { to: "/admin/stories", label: "Happy Travellers", icon: Star },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState({ checking: true, admin: null });
  const navigate = useNavigate();
  useEffect(() => {
    const token=sessionStorage.getItem("naystrip_admin_session");
    if(!token){setSession({checking:false,admin:null});return;}
    fetch("/api/auth/admin",{headers:{Authorization:`Bearer ${token}`}}).then(async(response)=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setSession({checking:false,admin:data.admin});}).catch(()=>{adminLogout();setSession({checking:false,admin:null});});
  },[]);
  if (session.checking) return <PageLoader full label="Checking secure admin session…" />;
  if (!isAdminLoggedIn() || !session.admin) return <Navigate to="/admin/login" replace />;
  const visibleNavItems = navItems.filter((item) => item.to !== "/admin/agents" || ["Super Admin", "B2B Manager"].includes(session.admin.role));

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const SidebarContent = (
    <>
      <div className="px-5 py-5">
        <Link to="/" aria-label="NaysTrip home"><BrandLogo className="h-20 w-auto" /></Link>
        <span className="mt-1 block text-xs font-semibold uppercase tracking-[.16em] text-white/50">Admin console</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-gold-300" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={17} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-terracotta-400 transition-colors">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-navy-50/40 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-navy-950 min-h-screen sticky top-0">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-navy-950 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-6 text-white/60"><X size={20} /></button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-navy-100 px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-navy-700"><Menu size={22} /></button>
            <div className="relative hidden sm:block max-w-xs w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input placeholder="Search..." className="w-full rounded-xl border border-navy-200 bg-navy-50/50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-terracotta-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-navy-500"><Bell size={19} /><span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-terracotta-500" /></button>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">A</span>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-navy-800">{session.admin.displayName || "Admin User"}</p>
                <p className="text-[11px] text-navy-400">{session.admin.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
