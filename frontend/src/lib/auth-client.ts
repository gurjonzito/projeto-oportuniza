import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL!,
  {
    adapter: BetterAuthReactAdapter(), // ← ESSENCIAL para ter hooks
  }
);

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;