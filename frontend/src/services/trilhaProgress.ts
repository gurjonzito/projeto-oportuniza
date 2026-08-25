import api from "./api";
import type { TrilhaProgress } from "../types/trilhaProgress";

export async function getTrilhasProgress(): Promise<TrilhaProgress[]> {
  const { data } = await api.get("/api/trilhas/progresso");

  return data;
}

export async function getTrilhaProgress(
  slug: string
): Promise<TrilhaProgress | undefined> {
  try {
    const { data } = await api.get(`/api/trilhas/${slug}/progresso`);
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404 || status === 401) {
      return undefined; // usuário não logado ou trilha sem progresso
    }
    throw error;
  }
}

export async function marcarVideoConcluido(
  slug: string,
  videoId: string
): Promise<TrilhaProgress> {
  const { data } = await api.post(
    `/api/trilhas/${slug}/progresso/videos/${videoId}`
  );

  return data;
}