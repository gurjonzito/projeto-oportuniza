import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

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
import Integracoes from "../pages/Integracoes";

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
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
        <Route path="/integracoes" element={<Integracoes />} />
      </Routes>
    </MainLayout>
  );
}
