import { useEffect, useState } from "react";
import api from "../services/api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}