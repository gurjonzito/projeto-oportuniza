import { ResetPasswordForm, authLocalization } from "@neondatabase/auth-ui";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function ResetPassword() {
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
              Nova senha
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Defina uma nova senha para acessar sua conta
            </p>
          </div>

          {/* Formulário */}
          <div className="px-7 py-6">
            <ResetPasswordForm localization={authLocalization} />
          </div>

          {/* Footer */}
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