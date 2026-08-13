import api from "./api";
import type { Recurso } from "../types/recurso";

export async function getRecursos(): Promise<Recurso[]> {
  const { data } = await api.get("/recursos");

  return data.recursos ?? [];
}