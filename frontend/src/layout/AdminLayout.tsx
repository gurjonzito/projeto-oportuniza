import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Tv2,
  PlayCircle,
  BookOpen,
  Tag,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Visão Geral", icon: LayoutDashboard, path: "/admin" },
  { label: "Canais", icon: Tv2, path: "/admin/canais" },
  { label: "Vídeos", icon: PlayCircle, path: "/admin/videos" },
  { label: "Trilhas", icon: BookOpen, path: "/admin/trilhas" },
  { label: "Categorias", icon: Tag, path: "/admin/categorias" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div
      className="flex min-h-screen transition-colors"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-56 min-h-screen flex flex-col py-7 px-3 border-r shrink-0 transition-colors"
        style={{
          backgroundColor: "var(--card-bg, white)",
          borderColor: "var(--border-color, #e5e7eb)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center">
            <LayoutDashboard size={15} color="white" />
          </div>
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            Oportuniza
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const color = active ? "#ffffff" : "var(--text-color)";

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-[#1E40AF]" : ""
                }`}
                style={{
                  color,
                  backgroundColor: active ? "#1E40AF" : undefined,
                }}
                onMouseEnter={
                  !active
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--hover-bg)")
                    : undefined
                }
                onMouseLeave={
                  !active
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                    : undefined
                }
              >
                <Icon size={16} color={color} />
                <span className="flex-1 text-left" style={{ color }}>
                  {item.label}
                </span>
                {active && <ChevronRight size={13} color={color} />}
              </button>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition mb-1"
          style={{ color: "var(--text-muted, #6b7280)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--hover-bg, #f3f4f6)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? "Modo claro" : "Modo escuro"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 px-8 py-7 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
