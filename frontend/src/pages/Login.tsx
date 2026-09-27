import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, signUp, authClient } from "../lib/auth-client";

import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  // "login" | "cadastro" | "forgot"
  const [view, setView] = useState<"login" | "cadastro" | "forgot">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isCadastro = view === "cadastro";
  const isForgot = view === "forgot";

  function trocarView(novaView: "login" | "cadastro" | "forgot") {
    setView(novaView);
    setError("");
    setSuccess("");
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!email || (!isForgot && !password)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (isCadastro) {
      if (!name.trim()) return setError("Informe seu nome completo.");
      if (!confirmPassword) return setError("Confirme sua senha.");
      if (password !== confirmPassword) return setError("As senhas não coincidem.");
      if (password.length < 8)
        return setError("A senha deve possuir pelo menos 8 caracteres.");
    }

    setLoading(true);

    try {
      // ─── ESQUECI A SENHA ────────────────────────────────────────────
      if (isForgot) {
        const { error: forgotError } = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (forgotError) {
          setError(
            forgotError.message || "Não foi possível enviar o email."
          );
          return;
        }

        setSuccess(
          "Se este email estiver cadastrado, enviamos um link para redefinir sua senha. Verifique também a caixa de spam."
        );
        return;
      }

      // ─── LOGIN ──────────────────────────────────────────────────────
      if (view === "login") {
        const res = await signIn.email({ email, password, callbackURL: "/" });

        if (res?.error) {
          setError(res.error.message || "Email ou senha incorretos.");
          return;
        }

        navigate("/");
        return;
      }

      // ─── CADASTRO ───────────────────────────────────────────────────
      const res = await signUp.email({
        email,
        password,
        name: name.trim(),
        callbackURL: "/",
      });

      if (res?.error) {
        setError(res.error.message || "Erro ao criar conta. Tente novamente.");
        return;
      }

      navigate("/");
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
          {/* Header */}
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
              {isForgot
                ? "Recuperar senha"
                : isCadastro
                  ? "Crie sua conta"
                  : "Bem-vindo de volta"}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {isForgot
                ? "Enviaremos um link para você criar uma nova senha"
                : isCadastro
                  ? "Comece sua jornada de aprendizado"
                  : "Acesse trilhas de aprendizado gratuitas"}
            </p>
          </div>

          {/* Abas — só aparecem em login/cadastro */}
          {!isForgot && (
            <div
              className="flex border-b"
              style={{ borderColor: "var(--border-color, #e5e7eb)" }}
            >
              <button
                type="button"
                onClick={() => trocarView("login")}
                className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
                  view === "login"
                    ? "border-[#1E40AF] text-[#1E40AF]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => trocarView("cadastro")}
                className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
                  view === "cadastro"
                    ? "border-[#1E40AF] text-[#1E40AF]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Cadastrar
              </button>
            </div>
          )}

          {/* Conteúdo */}
          <div className={`px-7 ${isCadastro ? "py-5" : "py-6"}`}>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-col ${isCadastro ? "gap-2.5" : "gap-3"}`}
              >
                {/* Nome (só cadastro) */}
                {isCadastro && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-muted, #6b7280)" }}
                    >
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="auth-input w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                      placeholder="seu@email.com"
                      className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                  </div>
                </div>

                {/* Senha (login/cadastro) */}
                {!isForgot && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-muted, #6b7280)" }}
                    >
                      Senha
                    </label>

                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit();
                        }}
                        placeholder="••••••••"
                        className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* 👇 Link "Esqueci minha senha" abaixo do input */}
                    {view === "login" && (
                      <button
                        type="button"
                        onClick={() => trocarView("forgot")}
                        className="self-end text-[11px] font-semibold text-[#23A6F0] hover:underline -mt-0.5"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                )}

                {/* Confirmar senha (só cadastro) */}
                {isCadastro && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-muted, #6b7280)" }}
                    >
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit();
                        }}
                        placeholder="••••••••"
                        className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sucesso */}
                {success && (
                  <div
                    className="flex items-start gap-2 text-xs font-medium px-3 py-2 rounded-lg"
                    style={{
                      color: "#059669",
                      backgroundColor: "rgba(16, 185, 129, 0.10)",
                    }}
                  >
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Erro */}
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

                {/* Botão submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 mt-0.5"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading
                    ? isForgot
                      ? "Enviando..."
                      : isCadastro
                        ? "Criando conta..."
                        : "Entrando..."
                    : isForgot
                      ? "Enviar link de recuperação"
                      : isCadastro
                        ? "Criar conta"
                        : "Entrar"}
                </button>

                {/* Voltar para login (só em forgot) */}
                {isForgot && (
                  <button
                    type="button"
                    onClick={() => trocarView("login")}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#23A6F0] hover:underline mt-1"
                  >
                    <ArrowLeft size={13} />
                    Voltar para o login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-7 text-center border-t ${isCadastro ? "py-3" : "py-4"}`}
            style={{
              borderColor: "var(--border-color, #e5e7eb)",
              backgroundColor: "var(--bg-subtle, #f9fafb)",
            }}
          >
            <Link to="/" className="text-xs text-[#23A6F0] hover:underline">
              ← Voltar para o Oportuniza
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}