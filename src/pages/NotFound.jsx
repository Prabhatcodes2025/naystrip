import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Seo from "../components/shared/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found | NaysTrip & Treks" />
      <section className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="container-lg text-center">
          <Compass size={48} className="mx-auto text-terracotta-400 mb-6" />
          <h1 className="font-display text-4xl font-semibold text-navy-900">404</h1>
          <p className="text-navy-500 mt-3">Looks like this trail doesn't exist. Let's get you back on route.</p>
          <Link to="/" className="btn-primary mt-8 inline-flex">Back to Home</Link>
        </div>
      </section>
    </>
  );
}
