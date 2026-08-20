import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:5173",
  ],

  emailAndPassword: {
    enabled: true,
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
      trustedProviders: [
        "google",
        "email-password",
      ],
      allowDifferentEmails: false,
    },
  },

  advanced: {
    crossSubdomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      httpOnly: true,
    },
  },
});