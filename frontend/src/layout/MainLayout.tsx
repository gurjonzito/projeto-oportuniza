import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <main className="pt-24">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
