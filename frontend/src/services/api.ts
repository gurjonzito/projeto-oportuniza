import axios from "axios";

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

let tokenAtual: string | null = null;
let semSessao = false;
let buscandoToken: Promise<string | null> | null = null;

function limparToken() {
  tokenAtual = null;
  semSessao = false;
  buscandoToken = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("oportuniza:session-changed", limparToken);
  window.addEventListener("focus", limparToken);
}

async function obterToken(): Promise<string | null> {
  if (tokenAtual) return tokenAtual;
  if (semSessao) return null;
  if (buscandoToken) return buscandoToken;

  buscandoToken = (async () => {
    try {
      const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

      if (!authUrl) {
        throw new Error("VITE_NEON_AUTH_URL não configurada.");
      }

      const response = await fetch(
        `${authUrl.replace(/\/+$/, "")}/token`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            accept: "application/json",
          },
        },
      );

      if (response.status === 401) {
        semSessao = true;
        return null;
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
  (error) => {
    if (error.response?.status === 401) {
      const temToken = !!error.config?.headers?.Authorization;

      if (temToken) {
        limparToken();
      }

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