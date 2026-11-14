
import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "/",
  timeout: 60000,
  withCredentials: true,
});

const ROTAS_PUBLICAS = [
  "/auth/login",
  "/auth/logout",
  "/auth/register",
  "/auth/cadastro",
  "/auth/forgot-password",
  "/auth/reset-password",
];

interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let tokenAtual: string | null = null;
let buscandoToken: Promise<string | null> | null = null;

function limparToken() {
  tokenAtual = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("oportuniza:session-changed", limparToken);
  window.addEventListener("focus", limparToken);
}

const aguardar = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function obterToken(): Promise<string | null> {
  if (tokenAtual) return tokenAtual;
  if (buscandoToken) return buscandoToken;

  buscandoToken = (async () => {
    try {
      const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

      if (!authUrl) {
        throw new Error("VITE_NEON_AUTH_URL não configurada.");
      }

      const url = `${authUrl.replace(/\/+$/, "")}/token`;
      const intervalos = [0, 500, 1000];

      for (const intervalo of intervalos) {
        if (intervalo > 0) {
          await aguardar(intervalo);
        }

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            accept: "application/json",
          },
        });

        if (response.status === 401) {
          continue;
        }

        if (!response.ok) {
          throw new Error(`Neon Auth retornou HTTP ${response.status}`);
        }

        const data: { token?: string } = await response.json();

        if (!data.token) {
          throw new Error("JWT não encontrado na resposta do Neon Auth.");
        }

        tokenAtual = data.token;
        return tokenAtual;
      }

      console.warn("[api] Neon Auth ainda não disponibilizou o JWT.");
      return null;
    } catch (error) {
      console.error("[api] Erro ao obter JWT:", error);
      return null;
    } finally {
      buscandoToken = null;
    }
  })();

  return buscandoToken;
}

api.interceptors.request.use(
  async (config) => {
    const isRotaPublica = ROTAS_PUBLICAS.some((rota) =>
      config.url?.startsWith(rota),
    );

    if (isRotaPublica) return config;

    const token = await obterToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const config = error.config as ApiRequestConfig | undefined;
      const temToken = !!config?.headers?.Authorization;

      // Se o backend recusou um JWT, tenta obter outro uma única vez.
      if (temToken && config && !config._retry) {
        config._retry = true;
        limparToken();

        return api.request(config);
      }

      // Só redireciona quando houve falha de autenticação
      // após uma requisição que realmente levou um JWT.
      if (temToken) {
        const path = window.location.pathname;

        if (path.startsWith("/admin") && !path.includes("/admin/login")) {
          window.location.href = "/admin/login";
        } else if (path.startsWith("/user")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
