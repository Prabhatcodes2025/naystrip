import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Eye, EyeOff, Lock, Mail, ShieldCheck, Info } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "../../utils/storage";
import Seo from "../../components/shared/Seo";
import { Navigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  if (isAdminLoggedIn()) return <Navigate to="/admin" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminLogin(email, password, remember)) {
      navigate("/admin");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <>
      <Seo title="Admin Login | Altiora Journeys" />
      <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden px-4">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=60"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-navy-950 mb-4">
              <Compass size={26} />
            </span>
            <h1 className="font-display text-2xl font-bold text-white">Altiora Journeys</h1>
            <p className="text-white/50 text-sm mt-1">Admin Dashboard</p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lift">
            <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">Welcome Back</h2>
            <p className="text-sm text-navy-500 mb-6">Sign in to manage your website content.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field"><Mail size={14} className="inline mr-1.5 -mt-0.5" />Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="admin@travel.com" />
              </div>
              <div>
                <label className="label-field"><Lock size={14} className="inline mr-1.5 -mt-0.5" />Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-11" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-terracotta-500">{error}</p>}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-navy-500">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-terracotta-500" />
                  Remember me
                </label>
              </div>
              <button type="submit" className="btn-primary w-full">
                <ShieldCheck size={16} /> Secure Login
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-gold-50 p-3.5">
              <Info size={15} className="text-gold-600 shrink-0 mt-0.5" />
              <p className="text-xs text-navy-600">
                Demo Login — Email: <strong>admin@travel.com</strong> · Password: <strong>admin123</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
