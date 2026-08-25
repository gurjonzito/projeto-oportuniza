import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL ?? "http://localhost:3000")
    : "", // em produção usa proxy do Vercel
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  linkSocial,
  unlinkAccount,
  listAccounts,
} = authClient;