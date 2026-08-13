import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Map, Users, MessageSquare, Newspaper, Star, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { tours } from "../../data/tours";
import { fixedDepartures } from "../../data/content";
import { getCustomLeads, getContactLeads, getAdminBlogs, getAdminTours, getAdminStories } from "../../utils/storage";

const leadTrend = [
  { day: "Mon", leads: 4 }, { day: "Tue", leads: 7 }, { day: "Wed", leads: 5 },
  { day: "Thu", leads: 9 }, { day: "Fri", leads: 12 }, { day: "Sat", leads: 15 }, { day: "Sun", leads: 10 },
];

const categoryChart = [
  { category: "Domestic", value: 42 }, { category: "International", value: 12 },
  { category: "Treks", value: 8 }, { category: "Expeditions", value: 4 }, { category: "Corporate", value: 6 },
];

export default function AdminDashboard() {
  const [leadState,setLeadState]=useState({custom:[],contact:[],loading:true,error:""});
  useEffect(()=>{let active=true;Promise.all([getCustomLeads(),getContactLeads()]).then(([custom,contact])=>{if(active)setLeadState({custom:Array.isArray(custom)?custom:[],contact:Array.isArray(contact)?contact:[],loading:false,error:""})}).catch((error)=>{if(active)setLeadState({custom:[],contact:[],loading:false,error:error.message||"Dashboard data could not be loaded"})});return()=>{active=false}},[]);
  const customLeads = leadState.custom;
  const contactLeads = leadState.contact;
  const adminBlogs = getAdminBlogs();
  const adminTours = getAdminTours();
  const adminStories = getAdminStories();

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = [...customLeads, ...contactLeads].filter((l) => new Date(l.created_at||l.submittedAt).getTime() > weekAgo).length;
    return [
      { label: "Total Tours", value: tours.length + adminTours.length, icon: Map, color: "bg-forest-50 text-forest-600" },
      { label: "Custom Trip Leads", value: customLeads.length, icon: Users, color: "bg-terracotta-50 text-terracotta-600" },
      { label: "Contact Inquiries", value: contactLeads.length, icon: MessageSquare, color: "bg-navy-50 text-navy-600" },
      { label: "Published Blogs", value: 6 + adminBlogs.filter((b) => b.published !== false).length, icon: Newspaper, color: "bg-gold-50 text-gold-600" },
      { label: "Happy Traveller Stories", value: 6 + adminStories.length, icon: Star, color: "bg-forest-50 text-forest-600" },
      { label: "New Leads This Week", value: newThisWeek, icon: TrendingUp, color: "bg-terracotta-50 text-terracotta-600" },
    ];
  }, [customLeads, contactLeads, adminBlogs, adminTours, adminStories]);

  const recentInquiries = [...customLeads.map((l) => ({ ...l, kind: "Custom Trip" })), ...contactLeads.map((l) => ({ ...l, kind: "Contact" }))]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 6);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Dashboard</h1>
          <p className="text-sm text-navy-500 mt-1">Welcome back — here's how things are looking today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/tours" className="rounded-full bg-terracotta-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-600 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add Tour
          </Link>
        </div>
      </div>

      {leadState.loading&&<p role="status" className="mb-5 rounded-xl bg-white p-4 text-sm text-navy-500">Loading live dashboard data…</p>}
      {leadState.error&&<div role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><p>{leadState.error}</p><p className="mt-1 text-xs">The dashboard remains available; open a section or retry by refreshing this page.</p></div>}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-navy-100 p-4 shadow-soft">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color} mb-3`}>
              <s.icon size={16} />
            </span>
            <p className="font-display text-xl font-bold text-navy-900">{s.value}</p>
            <p className="text-[11px] text-navy-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-2xl bg-white border border-navy-100 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">Lead Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={leadTrend}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#df5326" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#df5326" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#83a3aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#83a3aa" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="leads" stroke="#df5326" strokeWidth={2} fill="url(#leadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-white border border-navy-100 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">Tours by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#83a3aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#83a3aa" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#294d56" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-navy-100 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-navy-800">Recent Inquiries</h3>
            <Link to="/admin/leads" className="text-xs font-semibold text-terracotta-600 flex items-center gap-1">View All <ArrowRight size={12} /></Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-navy-400 py-8 text-center">No inquiries yet. They'll appear here as they come in.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-navy-400 border-b border-navy-100">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((l) => (
                    <tr key={l.id} className="border-b border-navy-50 last:border-0">
                      <td className="py-2.5 font-medium text-navy-800">{l.name || `${l.firstName || ""} ${l.lastName || ""}`}</td>
                      <td className="py-2.5 text-navy-500">{l.kind}</td>
                      <td className="py-2.5 text-navy-500">{new Date(l.created_at||l.submittedAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-forest-50 text-forest-700 px-2.5 py-1 text-[11px] font-semibold">{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">Upcoming Departures</h3>
          <div className="space-y-3">
            {fixedDepartures.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-navy-800">{d.destination}</p>
                  <p className="text-xs text-navy-400">{d.date}</p>
                </div>
                <span className="text-xs font-semibold text-terracotta-600">{d.seatsLeft} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
