import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";
import { enviarEmail } from "../services/emailService";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: "/api/auth",

  trustedOrigins: [
  // Produção — com e sem www
  "https://oportunizajovem.com.br",
  "https://www.oportunizajovem.com.br",

  // Backend próprio (para chamadas server-side, se houver)
  "https://api.oportunizajovem.com.br",

  // Desenvolvimento local
  "http://localhost:5173",
],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    // 👇 AQUI
    sendResetPassword: async ({ user, url }) => {
      await enviarEmail({
        to: user.email,
        subject: "Redefinir sua senha — Oportuniza",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1E40AF; margin: 0 0 16px;">Redefinir sua senha</h2>

            <p style="color: #111827; font-size: 14px; line-height: 1.6;">
              Olá, ${user.name || "tudo bem"}!
            </p>

            <p style="color: #111827; font-size: 14px; line-height: 1.6;">
              Recebemos um pedido para redefinir a senha da sua conta no Oportuniza.
              Clique no botão abaixo para criar uma nova senha.
            </p>

            <p style="color: #111827; font-size: 14px; line-height: 1.6;">
              Este link expira em <strong>1 hora</strong>.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${url}"
                 style="display: inline-block; background: #1E40AF; color: #fff;
                        text-decoration: none; padding: 12px 28px; border-radius: 10px;
                        font-weight: 600; font-size: 14px;">
                Redefinir senha
              </a>
            </div>

            <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
              Se você não solicitou essa alteração, ignore este email.
              Sua senha permanece a mesma.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

            <p style="color: #9ca3af; font-size: 11px; text-align: center;">
              Oportuniza — Plataforma de trilhas de aprendizado gratuitas
            </p>
          </div>
        `,
      });
    },
  },

  logger: {
    disabled: false,
    level: "warn",
    log: (level, message, ...args) => {
      const prefix = "[Better Auth]";
      if (level === "error") return console.error(prefix, message, ...args);
      if (level === "warn") return console.warn(prefix, message, ...args);
      if (level === "info") return console.info(prefix, message, ...args);
      console.debug(prefix, message, ...args);
    },
  },

  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});