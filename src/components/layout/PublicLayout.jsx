import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
