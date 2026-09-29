import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";

import {
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

// =========================================================
// HELPERS DE FORÇA DE SENHA
// =========================================================

interface Requisito {
  id: string;
  label: string;
  test: (senha: string) => boolean;
}

const requisitos: Requisito[] = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    test: (s) => s.length >= 8,
  },
  {
    id: "upper",
    label: "Uma letra maiúscula",
    test: (s) => /[A-Z]/.test(s),
  },
  {
    id: "lower",
    label: "Uma letra minúscula",
    test: (s) => /[a-z]/.test(s),
  },
  {
    id: "number",
    label: "Um número",
    test: (s) => /\d/.test(s),
  },
  {
    id: "special",
    label: "Um caractere especial (!@#$...)",
    test: (s) => /[^A-Za-z0-9]/.test(s),
  },
];

function calcularForca(senha: string) {
  const atendidos = requisitos.filter((r) => r.test(senha)).length;

  if (senha.length === 0) return { nivel: 0, label: "", cor: "" };
  if (atendidos <= 2) return { nivel: 1, label: "Fraca", cor: "#ef4444" };
  if (atendidos === 3) return { nivel: 2, label: "Média", cor: "#f59e0b" };
  if (atendidos === 4) return { nivel: 3, label: "Boa", cor: "#3b82f6" };
  return { nivel: 4, label: "Forte", cor: "#10b981" };
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

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

  const inputRef = useRef<HTMLInputElement>(null);

  // ⚠️ Auto-focus no primeiro input
  useEffect(() => {
    if (!success && token) {
      inputRef.current?.focus();
    }
  }, [success, token]);

  const forca = calcularForca(newPassword);
  const senhasCoincidem =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const senhasDiferentes =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  // =========================================================
  // SUBMIT
  // =========================================================

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
      setTimeout(() => navigate("/login"), 3500);
    } catch (err) {
      console.error("Erro:", err);
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // TELA — TOKEN INVÁLIDO
  // =========================================================

  if (!token) {
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
                Link inválido
              </h1>
              <p className="text-blue-200 text-sm mt-1">
                Este link não é mais válido
              </p>
            </div>

            <div className="px-7 py-8 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle size={32} className="text-red-500" />
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--text-muted, #6b7280)" }}
              >
                O link de redefinição expirou ou é inválido. Solicite um novo
                para continuar.
              </p>
              <Link
                to="/login"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // TELA PRINCIPAL
  // =========================================================

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6"
      style={{
        backgroundColor: "var(--bg-color, #f0f7ff)",
        color: "var(--text-color, #111827)",
      }}
    >
      {/* Círculos decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1E40AF]/10" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#23A6F0]/10" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-[#1E40AF]/5" />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: "var(--card-bg, white)" }}
        >
          {/* ─── Header ───────────────────────────────────── */}
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

          {/* ─── Conteúdo ─────────────────────────────────── */}
          <div className="px-7 py-6">
            {success ? (
              // ─── Estado de sucesso ─────────────────────
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
                  <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <p className="text-base font-bold text-green-600">
                  Senha redefinida com sucesso!
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  Redirecionando para o login...
                </p>

                <div className="w-full bg-green-500/10 h-1 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      animation: "progress 3.5s linear forwards",
                    }}
                  />
                </div>

                <style>{`
                  @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                  }
                `}</style>
              </div>
            ) : (
              // ─── Formulário ────────────────────────────
              <div className="flex flex-col gap-4">
                {/* ─── Nova senha ─────────────────────── */}
                <div className="flex flex-col gap-1.5">
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
                      ref={inputRef}
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
                      aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* ─── Barra de força + label ──────── */}
                  {newPassword.length > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(forca.nivel / 4) * 100}%`,
                            backgroundColor: forca.cor,
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: forca.cor }}
                      >
                        {forca.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── Confirmar senha ──────────────────── */}
                <div className="flex flex-col gap-1.5">
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
                      style={{
                        borderColor: senhasCoincidem
                          ? "#10b981"
                          : senhasDiferentes
                            ? "#ef4444"
                            : undefined,
                      }}
                    />

                    {/* Ícone de match na direita */}
                    {senhasCoincidem && (
                      <CheckCircle2
                        size={15}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                      aria-label={
                        showConfirm ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Feedback de match */}
                  {confirmPassword.length > 0 && (
                    <p
                      className="text-[11px] font-medium flex items-center gap-1 mt-0.5"
                      style={{
                        color: senhasCoincidem ? "#10b981" : "#ef4444",
                      }}
                    >
                      {senhasCoincidem ? (
                        <>
                          <Check size={12} /> As senhas coincidem
                        </>
                      ) : (
                        <>
                          <X size={12} /> As senhas não coincidem
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* ─── Checklist de requisitos ─────────── */}
                {newPassword.length > 0 && forca.nivel < 4 && (
                  <div
                    className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: "var(--bg-subtle, #f3f4f6)",
                      borderColor: "var(--border-color, #e5e7eb)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck
                        size={14}
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      />
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-muted, #6b7280)" }}
                      >
                        Requisitos da senha
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {requisitos.map((req) => {
                        const atendido = req.test(newPassword);
                        return (
                          <li
                            key={req.id}
                            className="flex items-center gap-2 text-[11px]"
                            style={{
                              color: atendido
                                ? "#10b981"
                                : "var(--text-muted, #9ca3af)",
                            }}
                          >
                            {atendido ? (
                              <Check size={12} />
                            ) : (
                              <X size={12} opacity={0.5} />
                            )}
                            {req.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* ─── Erro ────────────────────────────── */}
                {error && (
                  <div
                    className="flex items-start gap-2 text-xs font-medium px-3 py-2 rounded-lg"
                    style={{
                      color: "#dc2626",
                      backgroundColor: "rgba(239, 68, 68, 0.10)",
                    }}
                  >
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ─── Botão ───────────────────────────── */}
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

          {/* ─── Footer ─────────────────────────────────── */}
          <div
            className="px-7 py-4 text-center border-t"
            style={{
              borderColor: "var(--border-color, #e5e7eb)",
              backgroundColor: "var(--bg-subtle, #f9fafb)",
            }}
          >
            <Link
              to="/login"
              className="text-xs text-[#23A6F0] hover:underline"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}