import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#1E40AF] z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-24">
        {/* Logo */}
        <h1 className="text-white text-2xl font-bold tracking-wide">
          <Link to="/" className="hover:opacity-80 transition">
            Oportuniza
          </Link>
        </h1>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex gap-10 text-white font-medium">
          <Link to="/" className="hover:opacity-80 transition">
            Home
          </Link>
          <Link to="/sobre" className="hover:opacity-80 transition">
            Sobre
          </Link>
          <Link to="/trilhas" className="hover:opacity-80 transition">
            Trilhas
          </Link>
          <Link to="/videos" className="hover:opacity-80 transition">
            Vídeos
          </Link>
          <Link to="/contato" className="hover:opacity-80 transition">
            Contato
          </Link>
          <Link to="/mobile" className="hover:opacity-80 transition">
            Download
          </Link>
        </nav>

        {/* Ações e Hamburger */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Botão COMEÇAR Desktop */}
          <button
            onClick={() => navigate(`/trilhas`)}
            className="hidden md:flex bg-[#23A6F0] text-white px-6 py-3 rounded-md font-semibold hover:brightness-110 transition cursor-pointer"
          >
            COMEÇAR →
          </button>
          
          {/* Hamburger Mobile */}
          <div className="lg:hidden relative w-8 h-8">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute top-0 left-0 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            >
              <span
                className={`block h-0.5 w-6 bg-white transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-white transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Modern */}
      <div
        className={`lg:hidden fixed top-23 left-0 w-full bg-[#1E40AF] shadow-lg overflow-hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 max-h-125 py-6" : "opacity-0 max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-4 px-6 text-white">
          <Link
            to="/"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/sobre"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Sobre
          </Link>
          <Link
            to="/trilhas"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Trilhas
          </Link>
          <Link
            to="/videos"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Vídeos
          </Link>
          <Link
            to="/contato"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Contato
          </Link>
          <Link
            to="/mobile"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Download
          </Link>
          {/* Botão COMEÇAR Mobile */}
          <button
            onClick={() => { navigate(`/trilhas`); setMenuOpen(false); }}
            className="flex md:hidden bg-[#23A6F0] items-center justify-center text-white px-5 py-3 rounded-md font-semibold mt-0 hover:brightness-110 transition"
          >
           COMEÇAR →
          </button>
        </nav>

      </div>
    </header>
  );
}
