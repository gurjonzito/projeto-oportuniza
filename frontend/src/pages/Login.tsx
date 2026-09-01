import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signIn, signUp } from "../lib/auth-client";

import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const isCadastro = tab === "cadastro";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "google") {
      setError("Não foi possível entrar com o Google. Tente novamente.");
      const next = new URLSearchParams(searchParams);
      next.delete("error");
      setSearchParams(next, { replace: true });
    }
  }, []);

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);
      setError("");

      const frontendURL = import.meta.env.VITE_FRONTEND_URL ?? window.location.origin;

      const { error } = await signIn.social({
        provider: "google",
        callbackURL: `${frontendURL}/`,
        errorCallbackURL: `${frontendURL}/login?error=google`,
      });

      if (error) {
        setError(error.message || "Não foi possível entrar com o Google.");
        setGoogleLoading(false);
      }
    } catch (error: any) {
      setError(error?.message || "Não foi possível entrar com o Google.");
      setGoogleLoading(false);
    }
  }

  function trocarTab(novaTab: "login" | "cadastro") {
    setTab(novaTab);
    setError("");
  }

  async function handleSubmit() {
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (isCadastro) {
      if (!name.trim()) {
        setError("Informe seu nome completo.");
        return;
      }
      if (!confirmPassword) {
        setError("Confirme sua senha.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      if (password.length < 8) {
        setError("A senha deve possuir pelo menos 8 caracteres.");
        return;
      }
    }

    setLoading(true);

    try {
      if (!isCadastro) {
        const res = await signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (res?.error) {
          setError(res.error.message || "Email ou senha incorretos.");
          return;
        }

        navigate("/");
        return;
      }

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
              {isCadastro ? "Crie sua conta" : "Bem-vindo de volta"}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {isCadastro
                ? "Comece sua jornada de aprendizado"
                : "Acesse trilhas de aprendizado gratuitas"}
            </p>
          </div>

          {/* Abas */}
          <div
            className="flex border-b"
            style={{ borderColor: "var(--border-color, #e5e7eb)" }}
          >
            <button
              type="button"
              onClick={() => trocarTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
                tab === "login"
                  ? "border-[#1E40AF] text-[#1E40AF]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarTab("cadastro")}
              className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
                tab === "cadastro"
                  ? "border-[#1E40AF] text-[#1E40AF]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Conteúdo */}
          <div className={`px-7 ${isCadastro ? "py-5" : "py-6"}`}>
            <div className="flex flex-col gap-4">

              {/* Login com Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
                style={{
                  borderColor: "var(--border-color, #e5e7eb)",
                  color: "var(--text-color, #111827)",
                  backgroundColor: "var(--card-bg, white)",
                }}
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#4285F4] rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continuar com Google
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color, #e5e7eb)" }} />
                <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted, #9ca3af)" }}>
                  ou use seu email
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color, #e5e7eb)" }} />
              </div>

              {/* Formulário */}
              <div className={`flex flex-col ${isCadastro ? "gap-2.5" : "gap-3"}`}>
                {/* Nome */}
                {isCadastro && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
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
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #9ca3af)" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                      placeholder="seu@email.com"
                      className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
                    Senha
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #9ca3af)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
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
                </div>

                {/* Confirmar senha */}
                {isCadastro && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #9ca3af)" }} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                        placeholder="••••••••"
                        className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Erro */}
                {error && (
                  <p
                    className="text-xs font-medium px-3 py-2 rounded-lg"
                    style={{ color: "#dc2626", backgroundColor: "rgba(239, 68, 68, 0.10)" }}
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
                    ? isCadastro ? "Criando conta..." : "Entrando..."
                    : isCadastro ? "Criar conta" : "Entrar"}
                </button>
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