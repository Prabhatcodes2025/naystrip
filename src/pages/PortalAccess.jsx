import MathCaptcha from "../components/shared/MathCaptcha";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2, LockKeyhole, UserRound } from "lucide-react";
import BrandLogo from "../components/branding/BrandLogo";
import Seo from "../components/shared/Seo";
import { getTurnstileToken } from "../utils/storage";

export default function PortalAccess() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const agent = pathname.startsWith("/b2b");
  const register = pathname.endsWith("/register");
  const [form, setForm] = useState({ email: "", password: "", name: "", businessName: "", pan: "", phone: "" });
  const [state, setState] = useState({ loading: false, error: "", ok: "" });
  const [math,setMath]=useState({}),[attempt,setAttempt]=useState(0);
  const Icon = agent ? Building2 : UserRound;
  const requestedReturn = params.get("returnTo") || "";
  const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//")
    ? requestedReturn
    : (agent ? "/b2b/dashboard" : "/account/dashboard");
  const preserveReturn = requestedReturn ? `?returnTo=${encodeURIComponent(returnTo)}` : "";

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "", ok: "" });
    try {
      const captchaToken = register ? await getTurnstileToken() : null;
      const response = await fetch(register ? "/api/auth/register" : "/api/auth/portal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email:form.email.trim().toLowerCase(), ...math, portal: agent ? "agent" : "customer", captchaToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to continue");
      if (data.access_token) sessionStorage.setItem(`naystrip_${agent ? "agent" : "customer"}_session`, data.access_token);
      setState({ loading: false, error: "", ok: register ? (agent ? "Application received. Your B2B account will be available after approval." : (data.confirmation_required ? "Check your email to confirm the account." : "Account created. You can now sign in.")) : "Signed in securely." });
      if (!register) navigate(returnTo, { replace: true });
    } catch (error) { setState({ loading: false, error: error.message, ok: "" }); if(register)setAttempt(v=>v+1); }
  };

  return <>
    <Seo title={`${agent ? "B2B Partner" : "Customer"} ${register ? "Registration" : "Login"} | NaysTrip & Treks`} />
    <main className="grid min-h-[75vh] bg-[#fffaf2] lg:grid-cols-2">
      <section className="hidden bg-[#173c34] p-16 text-white lg:flex lg:flex-col lg:justify-end">
        <Link to="/" aria-label="NaysTrip home" className="mb-auto self-start"><BrandLogo animated className="h-32 w-auto" /></Link>
        <Icon size={32} className="text-orange-300" />
        <h1 className="mt-6 max-w-lg font-display text-6xl">{agent ? "A working desk for travel partners." : "Your journeys, documents and payments in one place."}</h1>
        <p className="mt-5 max-w-md leading-7 text-white/65">{agent ? "Approved partners can access private rates, bookings, ledgers and marketing material." : "Access booking status, payment records and documents tied to your verified account."}</p>
      </section>
      <section className="grid place-items-center p-6 sm:p-12"><div className="w-full max-w-md">
        <Link to="/" aria-label="NaysTrip home" className="mb-8 inline-flex lg:hidden"><BrandLogo animated className="h-24 w-auto" /></Link>
        <p className="eyebrow">{agent ? "Partner portal" : "Customer portal"}</p>
        <h2 className="mt-3 font-display text-4xl text-[#173c34]">{register ? "Create your account" : "Welcome back"}</h2>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {register && <>
            <label className="block"><span className="label-field">{agent ? "Contact person" : "Full name"}</span><input required value={form.name} onChange={update("name")} className="input-field" /></label>
            {agent && <><label className="block"><span className="label-field">Business name</span><input required value={form.businessName} onChange={update("businessName")} className="input-field" /></label><label className="block"><span className="label-field">PAN</span><input required maxLength="10" pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" title="Use the format AAAAA9999A" value={form.pan} onChange={(event)=>setForm({...form,pan:event.target.value.toUpperCase()})} className="input-field uppercase" placeholder="AAAAA9999A" /></label></>}
            <label className="block"><span className="label-field">Phone</span><input required inputMode="tel" value={form.phone} onChange={update("phone")} className="input-field" placeholder="+91 98765 43210" /></label>
          </>}
          <label className="block"><span className="label-field">Email</span><input type="email" required value={form.email} onChange={update("email")} onBlur={()=>setForm((current)=>({...current,email:current.email.trim().toLowerCase()}))} className="input-field" placeholder="name@example.com" /></label>
          <label className="block"><span className="label-field">Password</span><div className="relative"><LockKeyhole size={17} className="absolute left-4 top-3.5 text-slate-400" /><input type="password" minLength="10" required value={form.password} onChange={update("password")} className="input-field pl-11" /></div></label>
          {register && <MathCaptcha attempt={attempt} onChange={setMath}/>}
          {state.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
          {state.ok && <p role="status" className="text-sm text-emerald-700">{state.ok}</p>}
          <button disabled={state.loading||(register&&!math.mathChallengeId)} className="btn-primary w-full">{state.loading ? "Please wait…" : register ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
        </form>
        {!register && <Link className="mt-4 block text-sm font-bold text-orange-600" to={agent ? "/b2b/forgot-password" : "/account/forgot-password"}>Forgot password?</Link>}
        <p className="mt-6 text-sm text-slate-500">{register ? "Already registered? " : "New here? "}<Link className="font-bold text-orange-600" to={`${agent ? (register ? "/b2b/login" : "/b2b/register") : (register ? "/account/login" : "/account/register")}${preserveReturn}`}>{register ? "Sign in" : "Create an account"}</Link></p>
        {agent && register && <p className="mt-4 text-xs leading-5 text-slate-500">Partner access is granted only after NaysTrip verifies your business details and documents.</p>}
      </div></section>
    </main>
  </>;
}
