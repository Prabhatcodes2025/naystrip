import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import BrandLogo from "../../components/branding/BrandLogo";
import Seo from "../../components/shared/Seo";
import { adminLogin, isAdminLoggedIn } from "../../utils/storage";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (isAdminLoggedIn()) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    if (await adminLogin(email, password)) navigate("/admin");
    else setError("Sign-in failed. Check your account or ask a Super Admin to grant access.");
    setLoading(false);
  };

  return <>
    <Seo title="Admin Login | NaysTrip & Treks" />
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#102f29] px-4">
      <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=60" alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center text-white"><BrandLogo eager animated className="h-32 w-auto" /><p className="mt-2 text-sm text-white/50">Operations dashboard</p></div>
        <div className="bg-white p-8"><h1 className="font-display text-3xl text-[#173c34]">Secure sign in</h1><p className="mt-2 text-sm text-slate-500">Use the account assigned by your administrator.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block"><span className="label-field"><Mail size={14} className="mr-1 inline" />Email</span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="name@naystrip.com" /></label>
            <label className="block"><span className="label-field"><Lock size={14} className="mr-1 inline" />Password</span><span className="relative block"><input type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="input-field pr-12" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-3 text-slate-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60"><ShieldCheck size={16} />{loading ? "Signing in…" : "Secure login"}</button>
          </form>
        </div>
      </div>
    </main>
  </>;
}
