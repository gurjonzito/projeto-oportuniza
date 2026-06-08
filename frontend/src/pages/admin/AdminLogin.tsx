import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/adminApi";
import { LayoutDashboard } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleLogin() {
  if (!email || !password) return;
  setLoading(true);
  setError("");
  console.log("Tentando login com:", email, password);
  try {
    await loginAdmin(email, password);
    navigate("/admin");
  } catch (err: any) {
    console.error("Erro:", err?.response?.data);
    setError("Email ou senha incorretos.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-lg p-8 flex flex-col gap-6"
        style={{ backgroundColor: "var(--card-bg, white)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#1E40AF] flex items-center justify-center">
            <LayoutDashboard size={18} color="white" />
          </div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-color)" }}>
            Oportuniza Admin
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted, #6b7280)" }}>
            Acesso restrito ao administrador
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="seu@email.com"
              className="input-admin"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="input-admin"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 mt-1"
          >
            {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}