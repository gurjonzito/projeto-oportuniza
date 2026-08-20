import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1e293b]">
      {!isAuthPage && <Navbar />}

      <main className={isAuthPage ? "min-h-screen" : "pt-20"}>
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}