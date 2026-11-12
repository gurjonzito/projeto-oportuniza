import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.NEON_AUTH_BASE_URL,
  secret: process.env.NEON_AUTH_SECRET || process.env.BETTER_AUTH_SECRET,

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"], // Permite vincular automaticamente se o e-mail for igual
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        image: profile.picture,
      }),
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.image) {
            try {
              await prisma.user.upsert({
                where: { id: user.id },
                update: { image: user.image },
                create: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  image: user.image,
                },
              });
            } catch (error) {
              console.error("Erro ao sincronizar imagem (create):", error);
            }
          }
        },
      },
      update: {
        after: async (user) => {
          if (user.image) {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { image: user.image },
              });
            } catch (error) {
              console.error("Erro ao sincronizar imagem (update):", error);
            }
          }
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});