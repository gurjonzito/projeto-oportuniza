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
    const { data } = await api.get(
      `/api/trilhas/${slug}/progresso`
    );

    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return undefined;
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