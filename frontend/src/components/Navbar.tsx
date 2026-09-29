// frontend/src/components/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/auth-client";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // ─── Foto vinda do backend (presigned URL sempre fresca) ─────────
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setFoto(null);
      return;
    }

    // Busca a foto atualizada do backend
    api
      .get("/user/me")
      .then(({ data }) => {
        setFoto(data.image ?? session.user.image ?? null);
      })
      .catch(() => {
        // fallback pro que vem do Neon Auth (foto do Google)
        setFoto(session.user.image ?? null);
      });
  }, [session]);

  // ─── Escuta o evento de "foto atualizada" disparado pelo Account.tsx ───
  useEffect(() => {
    function handleFotoAtualizada(e: Event) {
      const novaFoto = (e as CustomEvent).detail as string | null;
      setFoto(novaFoto);
    }

    window.addEventListener("foto:atualizada", handleFotoAtualizada);
    return () => {
      window.removeEventListener("foto:atualizada", handleFotoAtualizada);
    };
  }, []);

  const user = session?.user;

  function handleLogin() {
    navigate("/login");
  }

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setDropdownOpen(false);
      setMenuOpen(false);
      navigate("/");
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/sobre", label: "Sobre" },
    { to: "/trilhas", label: "Trilhas" },
    { to: "/videos", label: "Vídeos" },
    { to: "/recursos", label: "Recursos" },
    { to: "/contato", label: "Contato" },
    { to: "/mobile", label: "Download" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-[#1E40AF] z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-20">
        <h1 className="text-white text-xl font-bold tracking-wide shrink-0">
          <Link to="/" className="hover:opacity-80 transition">
            Oportuniza
          </Link>
        </h1>

        <nav className="hidden lg:flex gap-7 text-white font-medium text-sm">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="hover:opacity-75 transition whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {user ? (
            <div
              className="hidden md:flex items-center gap-2 relative"
              ref={dropdownRef}
            >
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-full pl-1 pr-3 py-1"
              >
                {foto ? (
                  <img
                    src={foto}
                    alt={user.name ?? ""}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#23A6F0] flex items-center justify-center">
                    <User size={14} color="white" />
                  </div>
                )}

                <span className="text-white text-sm font-medium max-w-25 truncate">
                  {user.name?.split(" ")[0]}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-white/70 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-11 right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/user");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={14} className="text-gray-400" />
                    Minha conta
                  </button>

                  <button
                    onClick={() => {
                      navigate("/preferencias");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings size={14} className="text-gray-400" />
                    Preferências
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden md:flex items-center bg-white/10 border border-white/30 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition text-sm"
            >
              Entrar / Cadastrar
            </button>
          )}

          <div className="lg:hidden relative w-8 h-8">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute top-0 left-0 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            >
              <span
                className={`block h-0.5 w-6 bg-white transition-transform origin-center ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-transform origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden fixed top-20 left-0 w-full bg-[#1E40AF] shadow-lg overflow-hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 max-h-screen py-6" : "opacity-0 max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-4 px-6 text-white">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="hover:opacity-75 transition text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="w-full border-t border-white/20 pt-4 mt-1 flex flex-col items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {foto ? (
                    <img
                      src={foto}
                      alt={user.name ?? ""}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#23A6F0] flex items-center justify-center">
                      <User size={16} color="white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-white/60">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate("/user");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                >
                  <User size={14} />
                  Minha conta
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200 transition"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  setMenuOpen(false);
                }}
                className="flex items-center bg-white/10 border border-white/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}