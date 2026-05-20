import api from "./api";

import type { Trilha } from "../types/trilha";

export async function getTrilhas(): Promise<Trilha[]> {
  const { data } = await api.get("/playlist");

  return data;
}

export async function getTrilhaBySlug(slug: string): Promise<Trilha> {
  const { data } = await api.get(`/playlist/${slug}`);

  return data;
}
