// frontend/src/services/api.ts
import axios from "axios";
import { authClient } from "../lib/auth-client";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  timeout: 10000,
  withCredentials: true,
});

// ─── Rotas que NÃO devem receber Bearer ────────────────────────────
const ROTAS_PUBLICAS = [
  "/auth/login",
  "/auth/logout",
  "/auth/register",
  "/auth/cadastro",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// ─── Request interceptor: injeta o JWT do Neon Auth ────────────────
api.interceptors.request.use(
  async (config) => {
    const isRotaPublica = ROTAS_PUBLICAS.some((rota) =>
      config.url?.startsWith(rota)
    );

    if (isRotaPublica) {
      return config;
    }

    try {
      let token: string | undefined;

      // Tentativa 1: authClient.token() — versões novas do SDK
      if (typeof (authClient as any).token === "function") {
        const { data, error } = await (authClient as any).token();
        if (!error && data?.token) {
          token = data.token;
        }
      }

      // Tentativa 2 (fallback): getSession()
      if (!token) {
        const { data: session } = await authClient.getSession();
        token = (session as any)?.session?.token;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("[api] Erro ao obter token:", err);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: trata 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;

      if (path.startsWith("/admin") && !path.includes("/admin/login")) {
        window.location.href = "/admin/login";
      } else if (path.startsWith("/user")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;