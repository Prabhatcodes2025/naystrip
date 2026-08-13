import BrandLogo from "../branding/BrandLogo";
import { Link } from "react-router-dom";

export function PageLoader({ label = "Loading your next journey…", full = false }) {
  return <div role="status" aria-live="polite" className={`route-loader ${full ? "min-h-screen" : "min-h-[42vh]"}`}>
    <div className="text-center"><span className="route-spinner mx-auto"/><p className="mt-4 text-sm font-semibold text-[#173c34]">{label}</p></div>
  </div>;
}

export function GlobalPreloader() {
  return <div className="global-preloader" role="status" aria-live="polite"><div className="global-preloader__content"><BrandLogo variant="symbol" eager animated className="mx-auto h-24 w-24"/><p className="mt-5 text-sm font-bold text-[#173c34]">Preparing your journey…</p><span className="route-progress mt-4"/></div></div>;
}

export function CardSkeleton({ count = 6 }) {
  return <div aria-label="Loading content" role="status" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="skeleton aspect-[4/3]"/><div className="space-y-3 p-5"><div className="skeleton h-3 w-1/3"/><div className="skeleton h-7 w-4/5"/><div className="skeleton h-4 w-full"/></div></div>)}</div>;
}

export function TableSkeleton({ rows = 5 }) {
  return <div role="status" aria-label="Loading records" className="space-y-2 rounded-2xl border bg-white p-4">{Array.from({ length: rows }).map((_, index) => <div key={index} className="skeleton h-14 w-full rounded-xl"/>)}</div>;
}

export function LoadError({ message = "Unable to load this page. Please retry.", onRetry, loginTo }) {
  return <main className="grid min-h-screen place-items-center bg-[#fffaf2] p-6 text-center"><div><BrandLogo variant="symbol" className="mx-auto h-24 w-24"/><h1 className="mt-5 font-display text-3xl text-[#173c34]">We couldn’t load your workspace.</h1><p role="alert" className="mt-3 max-w-md text-sm text-slate-600">{message}</p><div className="mt-6 flex justify-center gap-3">{onRetry && <button onClick={onRetry} className="btn-primary">Try again</button>}{loginTo && <Link to={loginTo} className="btn-secondary">Sign in again</Link>}</div></div></main>;
}
