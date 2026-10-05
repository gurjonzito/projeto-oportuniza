import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Evento customizado para notificar mudanças de sessão em qualquer parte do app
export const SESSION_CHANGED_EVENT = "oportuniza:session-changed";

export function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  const verificarSessao = useCallback(async () => {
    try {
      const { data } = await api.get("/user/me");
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        image: data.image,
      });
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      try {
        const { data } = await api.get("/user/me");
        if (cancelado) return;

        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          image: data.image,
        });
        setStatus("authenticated");
      } catch {
        if (cancelado) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    buscar();

    // Re-verifica quando o app notifica login/logout
    function handleSessionChanged() {
      verificarSessao();
    }

    // Re-verifica quando a aba ganha foco
    function handleFocus() {
      verificarSessao();
    }

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelado = true;
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
      window.removeEventListener("focus", handleFocus);
    };
  }, [verificarSessao]);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user,
  };
}