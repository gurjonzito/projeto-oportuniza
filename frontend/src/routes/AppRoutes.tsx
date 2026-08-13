import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";
import AdminGuard from "../components/admin/AdminGuard";
import AdminLogin from "../pages/admin/AdminLogin";

import Home from "../pages/Home";
import Sobre from "../pages/Sobre";
import Trilhas from "../pages/Trilhas";
import Videos from "../pages/Videos";
import Contato from "../pages/Contato";
import Player from "../pages/Player";
import Mobile from "../pages/Mobile";
import Playlist from "../pages/TrilhaDetalhe";

import Seguranca from "../pages/legal/Seguranca";
import Termos from "../pages/legal/Termos";
import Cookies from "../pages/legal/Cookies";
import Privacidade from "../pages/legal/Privacidade";

import AdminOverview from "../pages/admin/AdminOverview";
import AdminCanais from "../pages/admin/AdminCanais";
import AdminVideos from "../pages/admin/AdminVideos";
import AdminTrilhas from "../pages/admin/AdminTrilhas";
import AdminCategorias from "../pages/admin/AdminCategorias";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/trilhas" element={<Trilhas />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/mobile" element={<Mobile />} />
        <Route path="/trilhas/:slug" element={<Playlist />} />
        <Route path="/seguranca" element={<Seguranca />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Route>

      {/* Login admin — fora do AdminLayout */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protegido */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="canais" element={<AdminCanais />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="trilhas" element={<AdminTrilhas />} />
        <Route path="categorias" element={<AdminCategorias />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}