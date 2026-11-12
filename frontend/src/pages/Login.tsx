import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { notifySessionChanged } from "../hooks/useSession";
import { ForgotPasswordForm } from "@neondatabase/auth-ui";

import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
  const [resendingEmail, setResendingEmail] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isCadastro = view === "cadastro";
  const isForgot = view === "forgot";

  // Detecta quando o usuário volta após clicar no link de verificação no e-mail
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") {
      setView("login");
      setSuccess(
        "E-mail confirmado com sucesso! Agora você já pode entrar com sua senha ou continuar com o Google."
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function trocarView(novaView: "login" | "cadastro" | "forgot") {
    setView(novaView);
    setError("");
    setSuccess("");
    setNeedsVerification(false);
  }

  async function reenviarLinkVerificacao() {
    if (!email) {
      setError("Informe seu e-mail acima para reenviar o link de confirmação.");
      return;
    }

    setError("");
    setSuccess("");
    setResendingEmail(true);

    try {
      const res = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/login`,
      });

      if (res?.error) {
        setError(
          res.error.message || "Não foi possível reenviar o e-mail de confirmação."
        );
        return;
      }

      setNeedsVerification(false);
      setSuccess(
        `Enviamos um novo link de confirmação para ${email}. Verifique sua caixa de entrada e spam.`
      );
    } catch (err) {
      console.error("Erro ao reenviar verificação:", err);
      setError("Erro ao reenviar o link de verificação.");
    } finally {
      setResendingEmail(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setNeedsVerification(false);

    if (!email || (!isForgot && !password)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (isCadastro) {
      if (!name.trim()) return setError("Informe seu nome completo.");
      if (!confirmPassword) return setError("Confirme sua senha.");
      if (password !== confirmPassword)
        return setError("As senhas não coincidem.");
      if (password.length < 8)
        return setError("A senha deve possuir pelo menos 8 caracteres.");
    }

    setLoading(true);

    try {
      // ─── LOGIN ──────────────────────────────────────────────────────
      if (view === "login") {
        const res = await authClient.signIn.email({ email, password });

        if (res?.error) {
          const msg = res.error.message?.toLowerCase() || "";

          if (msg.includes("verified") || res.error.status === 403) {
            setNeedsVerification(true);
            setError(
              "Seu e-mail ainda não foi verificado. Clique no link enviado para sua caixa de entrada."
            );
            return;
          }

          setError(res.error.message || "Email ou senha incorretos.");
          return;
        }

        notifySessionChanged();
        navigate("/");
        return;
      }

      // ─── CADASTRO (COM ENVIO DE LINK DE VERIFICAÇÃO) ───────────────
      const res = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
        callbackURL: `${window.location.origin}/login`,
      });

      if (res?.error) {
        setError(res.error.message || "Erro ao criar conta. Tente novamente.");
        return;
      }

      // Limpa senhas, volta para a aba de login e instrui a verificar o e-mail
      setPassword("");
      setConfirmPassword("");
      setView("login");
      setSuccess(
        `Conta criada! Enviamos um link de confirmação para ${email}. Clique no link do e-mail para ativar sua conta.`
      );
    } catch (err) {
      console.error("Erro:", err);
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/",
      });
    } catch (err) {
      console.error("Erro no Google:", err);
      setError("Não foi possível entrar com Google. Tente novamente.");
      setGoogleLoading(false);
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
            {isForgot ? (
              // ─── Fluxo "Esqueci minha senha" via componente do Neon ───
              <div className="flex flex-col gap-4">
                <ForgotPasswordForm
                  {...({
                    redirectTo: `${window.location.origin}/reset-password`,
                  } as any)}
                  onSuccess={() => {}}
                />

                {success && (
                  <div
                    className="flex items-start gap-2 text-xs font-medium px-3 py-2 rounded-lg mt-4"
                    style={{
                      color: "#059669",
                      backgroundColor: "rgba(16, 185, 129, 0.10)",
                    }}
                  >
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => trocarView("login")}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#23A6F0] hover:underline mt-4 w-full"
                >
                  <ArrowLeft size={13} />
                  Voltar para o login
                </button>
              </div>
            ) : (
              // ─── Login / Cadastro ───────────────────────────────────
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

                  {/* Senha */}
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
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>

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

                  {/* Sucesso (ex: link de verificação enviado ou confirmado) */}
                  {success && (
                    <div
                      className="flex items-start gap-2 text-xs font-medium px-3 py-2.5 rounded-lg"
                      style={{
                        color: "#059669",
                        backgroundColor: "rgba(16, 185, 129, 0.10)",
                      }}
                    >
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Erro + botão opcional de reenviar link */}
                  {error && (
                    <div
                      className="text-xs font-medium px-3 py-2.5 rounded-lg flex flex-col gap-1.5"
                      style={{
                        color: "#dc2626",
                        backgroundColor: "rgba(239, 68, 68, 0.10)",
                      }}
                    >
                      <p>{error}</p>
                      {needsVerification && (
                        <button
                          type="button"
                          onClick={reenviarLinkVerificacao}
                          disabled={resendingEmail}
                          className="self-start font-semibold underline hover:opacity-80 disabled:opacity-60"
                        >
                          {resendingEmail
                            ? "Reenviando..."
                            : "Reenviar link de confirmação"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Botão submit */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || googleLoading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 mt-0.5"
                  >
                    {loading && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading
                      ? isCadastro
                        ? "Criando conta..."
                        : "Entrando..."
                      : isCadastro
                        ? "Criar conta"
                        : "Entrar"}
                  </button>

                  {/* Divisor */}
                  <div className="relative my-1">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div
                        className="w-full border-t"
                        style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                      />
                    </div>
                    <div className="relative flex justify-center">
                      <span
                        className="px-3 text-xs"
                        style={{
                          backgroundColor: "var(--card-bg, white)",
                          color: "var(--text-muted, #6b7280)",
                        }}
                      >
                        ou
                      </span>
                    </div>
                  </div>

                  {/* Botão Google */}
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading || googleLoading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-semibold transition hover:bg-black/5 disabled:opacity-60"
                    style={{
                      borderColor: "var(--border-color, #e5e7eb)",
                      color: "var(--text-color, #111827)",
                    }}
                  >
                    {googleLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon size={18} />
                    )}
                    {googleLoading ? "Conectando..." : "Continuar com Google"}
                  </button>

                  {/* Voltar para login */}
                  {isCadastro && (
                    <button
                      type="button"
                      onClick={() => trocarView("login")}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#23A6F0] hover:underline mt-1"
                    >
                      <ArrowLeft size={13} />
                      Já tenho conta
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-7 text-center border-t ${
              isCadastro ? "py-3" : "py-4"
            }`}
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