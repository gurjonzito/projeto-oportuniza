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
    disableImplicitLinking: false,
    trustedProviders: ["google"],
  },
},

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "lax",  // funciona tanto em dev quanto em prod com proxy
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});