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

// Objeto com as traduções para português do Brasil.
// O spread (...authLocalization) mantém os textos padrão em inglês para
// qualquer chave que você ainda não traduziu.
const ptBR = {
  ...authLocalization,
  SIGN_IN: "Entrar",
  SIGN_UP: "Criar conta",
  FORGOT_PASSWORD: "Esqueci minha senha",
  FORGOT_PASSWORD_LINK: "Esqueci minha senha",
  FORGOT_PASSWORD_ACTION: "Enviar link de recuperação",
  FORGOT_PASSWORD_DESCRIPTION: "Informe seu e-mail para receber o link.",
  FORGOT_PASSWORD_EMAIL: "E-mail",
  FORGOT_PASSWORD_SUCCESS: "Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha.",
  RESET_PASSWORD: "Redefinir senha",
  RESET_PASSWORD_DESCRIPTION: "Defina sua nova senha.",
  NEW_PASSWORD: "Nova senha",
  NEW_PASSWORD_PLACEHOLDER: "Digite sua nova senha",
  CONFIRM_PASSWORD: "Confirmar nova senha",
  SAVE_NEW_PASSWORD: "Salvar nova senha",
  BACK_TO_SIGN_IN: "Voltar para o login",
  EMAIL: "E-mail",
  EMAIL_PLACEHOLDER: "seu@email.com",
  PASSWORD: "Senha",
  PASSWORD_PLACEHOLDER: "••••••••",
  NAME: "Nome completo",
  NAME_PLACEHOLDER: "Seu nome",
  SIGN_OUT: "Sair",
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
      social={{
        providers: ["google"],
      }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}