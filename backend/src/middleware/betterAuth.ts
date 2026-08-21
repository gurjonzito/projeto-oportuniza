import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // 🔑 IMPORTANTE: Configure a URL base do seu backend
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins: [
    "http://localhost:5173",
    "https://oportunizajovem.vercel.app"
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
      allowDifferentEmails: false,
      updateUserInfoOnLink: true,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // ✅ true em produção
      httpOnly: true,
    },
  },
});