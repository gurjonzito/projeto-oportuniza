import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL ?? "http://localhost:3000")
    : window.location.origin, // produção: mesmo domínio (Vercel)
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