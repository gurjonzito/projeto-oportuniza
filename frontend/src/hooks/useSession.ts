import { useEffect, useState } from "react";
import api from "../services/api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelado = false;

    // ⚠️ /user/me (usuário comum) e NÃO /auth/me (admin)
    api
      .get("/user/me")
      .then(({ data }) => {
        if (cancelado) return;
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          image: data.image,
        });
        setStatus("authenticated");
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("[useSession] Falha ao buscar sessão:", err?.response?.status);
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user,
  };
}