import axios from "axios";
import { authClient } from "../lib/auth-client";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  timeout: 10000,
  withCredentials: true, // Necessário para o SDK do Neon enviar cookies cross-origin
});

// Interceptor: injeta o JWT do Neon em cada requisição
api.interceptors.request.use(async (config) => {
  try {
    const { data, error } = await authClient.token();

    if (!error && data?.token) {
      config.headers.Authorization = `Bearer ${data.token}`;
    }
  } catch (err) {
    console.error("Erro ao obter JWT do Neon:", err);
  }

  return config;
});

export default api;