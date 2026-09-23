import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: "/api/auth",

  trustedOrigins: [
    "http://localhost:5173",
    "https://oportunizajovem.vercel.app",
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      disableImplicitLinking: true,
      trustedProviders: ["google"],
    },
  },

  logger: {
    disabled: false,
    level: "warn",

    log: (level, message, ...args) => {
      const mensagem = String(message ?? "").toLowerCase();

      if (
        mensagem.includes("account_not_linked") ||
        mensagem.includes("account isn't linked") ||
        mensagem.includes("account isn't linked to")
      ) {
        return;
      }

      const prefix = "[Better Auth]";

      if (level === "error") {
        console.error(prefix, message, ...args);
        return;
      }

      if (level === "warn") {
        console.warn(prefix, message, ...args);
        return;
      }

      if (level === "info") {
        console.info(prefix, message, ...args);
        return;
      }

      console.debug(prefix, message, ...args);
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});
