import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AUTH_PAGES = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/reset-password",
];

export default function MainLayout() {
  const location = useLocation();

  const isAuthPage = AUTH_PAGES.includes(location.pathname);

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