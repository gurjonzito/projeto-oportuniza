import { NeonAuthUIProvider, authLocalization } from "@neondatabase/auth-ui";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import type { ReactNode, AnchorHTMLAttributes } from "react";
import { authClient } from "./lib/auth-client";

function Link({
  href,
  ...props
}: { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <RouterLink to={href} {...props} />;
}

const ptBR = {
  ...authLocalization,

  // ─── Textos da interface ─────────────────────────────────────────
  SIGN_IN: "Entrar",
  SIGN_UP: "Criar conta",
  SIGN_OUT: "Sair",
  NAME: "Nome completo",
  NAME_PLACEHOLDER: "Seu nome",
  EMAIL: "E-mail",
  EMAIL_PLACEHOLDER: "seu@email.com",
  PASSWORD: "Senha",
  PASSWORD_PLACEHOLDER: "••••••••",

  // ─── Login / senha ───────────────────────────────────────────────
  FORGOT_PASSWORD: "Esqueci minha senha",
  FORGOT_PASSWORD_LINK: "Esqueci minha senha",
  FORGOT_PASSWORD_ACTION: "Enviar link de recuperação",
  FORGOT_PASSWORD_DESCRIPTION: "Informe seu e-mail para receber o link.",
  FORGOT_PASSWORD_EMAIL: "E-mail",
  FORGOT_PASSWORD_SUCCESS:
    "Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha.",

  // ─── Reset de senha ──────────────────────────────────────────────
  RESET_PASSWORD: "Redefinir senha",
  RESET_PASSWORD_DESCRIPTION: "Defina sua nova senha.",
  NEW_PASSWORD: "Nova senha",
  NEW_PASSWORD_PLACEHOLDER: "Digite sua nova senha",
  CONFIRM_PASSWORD: "Confirmar nova senha",
  SAVE_NEW_PASSWORD: "Salvar nova senha",
  BACK_TO_SIGN_IN: "Voltar para o login",

  // ─── Mensagens de erro (traduzidas aqui) ─────────────────────────
  PASSWORD_TOO_SHORT: "A senha é muito curta. Use no mínimo 8 caracteres.",
  PASSWORD_TOO_LONG: "A senha é muito longa.",
  PASSWORD_TOO_WEAK: "A senha é muito fraca. Escolha uma mais forte.",
  PASSWORD_COMPROMISED:
    "Esta senha foi encontrada em vazamentos de dados. Escolha outra.",
  INVALID_PASSWORD: "Senha inválida.",
  INVALID_EMAIL: "E-mail inválido.",
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_NOT_FOUND: "Usuário não encontrado.",
  USER_ALREADY_EXISTS: "Este e-mail já está cadastrado.",
  EMAIL_NOT_VERIFIED:
    "E-mail ainda não verificado. Verifique sua caixa de entrada.",
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",
  INVALID_TOKEN: "Token inválido ou expirado.",
  TOKEN_EXPIRED: "Token expirado. Solicite um novo link.",
  UNAUTHORIZED: "Não autorizado.",
};

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(path) => navigate(path)}
      replace={(path) => navigate(path, { replace: true })}
      Link={Link}
      localization={ptBR}
      localizeErrors={true}
      social={{
        providers: ["google"],
      }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}