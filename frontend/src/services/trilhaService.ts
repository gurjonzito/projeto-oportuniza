import api from "./api";
import type { Trilha } from "../types/trilha";

export async function getTrilhas(): Promise<Trilha[]> {
  const { data } = await api.get("/playlist");

  // Backend retorna { trilhas: [...] }
  // Blindagem: se por algum motivo vier diferente, retorna array vazio
  return Array.isArray(data) ? data : (data?.trilhas ?? []);
}

export async function getTrilhaBySlug(slug: string): Promise<Trilha> {
  const { data } = await api.get(`/playlist/${slug}`);

  // Backend retorna { trilha: {...} }
  return data?.trilha ?? data;
}