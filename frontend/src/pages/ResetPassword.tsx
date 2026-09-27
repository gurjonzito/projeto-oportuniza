import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";

import { BookOpen, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    setError("");

    if (!token) {
      setError("Link inválido ou expirado. Solicite um novo.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Preencha os dois campos.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (resetError) {
        setError(
          resetError.message ||
            "Não foi possível redefinir sua senha. O link pode ter expirado."
        );
        return;
      }

      setSuccess(true);

      // Redireciona pro login depois de 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Erro:", err);
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6"
      style={{
        backgroundColor: "var(--bg-color, #f0f7ff)",
        color: "var(--text-color, #111827)",
      }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1E40AF]/10" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#23A6F0]/10" />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: "var(--card-bg, white)" }}
        >
          <div className="bg-linear-to-br from-[#1E40AF] to-[#1d4ed8] px-7 pt-6 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <BookOpen size={18} color="white" />
              </div>
              <Link
                to="/"
                className="text-white font-bold text-lg hover:opacity-80 transition"
              >
                Oportuniza
              </Link>
            </div>

            <h1 className="text-white text-2xl font-bold leading-tight">
              Nova senha
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Defina uma nova senha para acessar sua conta
            </p>
          </div>

          <div className="px-7 py-6">
            {success ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <CheckCircle2 size={40} color="#10b981" />
                <p className="text-sm font-semibold text-green-600">
                  Senha redefinida com sucesso!
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Nova senha */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleReset();
                      }}
                      placeholder="••••••••"
                      className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    className="text-xs font-medium px-3 py-2 rounded-lg"
                    style={{
                      color: "#dc2626",
                      backgroundColor: "rgba(239, 68, 68, 0.10)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 mt-1"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? "Salvando..." : "Redefinir senha"}
                </button>
              </div>
            )}
          </div>

          <div
            className="px-7 py-4 text-center border-t"
            style={{
              borderColor: "var(--border-color, #e5e7eb)",
              backgroundColor: "var(--bg-subtle, #f9fafb)",
            }}
          >
            <Link to="/login" className="text-xs text-[#23A6F0] hover:underline">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}