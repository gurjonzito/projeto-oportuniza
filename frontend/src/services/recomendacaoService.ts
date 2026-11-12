import type { Trilha } from "../types/trilha";

export type RespostasQuestionario = {
  objetivo: string;
  nivel: string;
  areas: string[];
  tempoSemanal: string;
};

export type TrilhaRecomendada = {
  trilha: Trilha;
  compatibilidade: number;
  justificativa: string;
};

type RespostaAPI = {
  id: string;
  compatibilidade: number;
  justificativa: string;
};

const API_URL =
  import.meta.env.VITE_API_URL;

export async function recomendarTrilhas(
  respostas: RespostasQuestionario,
  trilhasDisponiveis: Trilha[]
): Promise<TrilhaRecomendada[]> {
  const response = await fetch(`${API_URL}/api/recomendacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      respostas,
      trilhas: trilhasDisponiveis.map((trilha) => ({
        id: String(trilha.id),
        titulo: trilha.titulo,
        slug: trilha.slug,
        categoria: trilha.categoria?.nome ?? "Sem categoria",
        nivel: trilha.nivel ?? "Não informado",
        totalVideos: trilha.videos?.length ?? 0,
      })),
    }),
  });

  if (!response.ok) {
    const erro = await response.text();

    throw new Error(
      `Erro ao obter recomendações: ${response.status} - ${erro}`
    );
  }

  const resultados: RespostaAPI[] = await response.json();

  return resultados
    .map(({ id, compatibilidade, justificativa }) => {
      const trilha = trilhasDisponiveis.find(
        (t) => String(t.id) === String(id)
      );

      if (!trilha) {
        return null;
      }

      return {
        trilha,
        compatibilidade,
        justificativa,
      };
    })
    .filter(
      (resultado): resultado is TrilhaRecomendada => resultado !== null
    );
}