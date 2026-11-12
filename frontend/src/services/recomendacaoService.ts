
import type { Trilha } from "../types/trilha";
import api from "./api";

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

export async function recomendarTrilhas(
  respostas: RespostasQuestionario,
  trilhasDisponiveis: Trilha[]
): Promise<TrilhaRecomendada[]> {
  const response = await api.post<RespostaAPI[]>(
    "/api/recomendacoes",
    {
      respostas,
      trilhas: trilhasDisponiveis.map((trilha) => ({
        id: String(trilha.id),
        titulo: trilha.titulo,
        slug: trilha.slug,
        categoria: trilha.categoria?.nome ?? "Sem categoria",
        nivel: trilha.nivel ?? "Não informado",
        totalVideos: trilha.videos?.length ?? 0,
      })),
    }
  );

  const resultados = response.data;

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
      (resultado): resultado is TrilhaRecomendada =>
        resultado !== null
    );
}
