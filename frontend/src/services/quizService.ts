import api from "./api";
import type { Quiz } from "../types/quiz";

export async function gerarQuiz(
  videoId: string | undefined
): Promise<Quiz | null> {
  if (!videoId) return null;

  try {
    const { data } = await api.get(`/api/quiz/${videoId}`);
    return data;
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    throw error;
  }
}