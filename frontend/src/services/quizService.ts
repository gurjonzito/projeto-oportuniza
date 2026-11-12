
import api from "./api";
import type { Quiz } from "../types/quiz";

export async function gerarQuiz(
  videoId: string | undefined
): Promise<Quiz | null> {
  if (!videoId) return null;

  const { data } = await api.get(`/api/quiz/${videoId}`, {
    timeout: 90000,
  });

  return data;
}
