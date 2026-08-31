import { Router } from "express";

import {
  recomendarTrilhas,
  type RespostasQuestionario,
  type TrilhaDisponivel,
} from "../services/recomendacaoService";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      respostas,
      trilhas,
    }: {
      respostas: RespostasQuestionario;
      trilhas: TrilhaDisponivel[];
    } = req.body;

    if (!respostas) {
      return res.status(400).json({
        error: "Respostas do questionário não informadas.",
      });
    }

    if (!Array.isArray(trilhas)) {
      return res.status(400).json({
        error: "Lista de trilhas inválida.",
      });
    }

    const resultado = await recomendarTrilhas(
      respostas,
      trilhas,
    );

    return res.json(resultado);
  } catch (error: any) {
    console.error(
      "Erro ao gerar recomendações:",
      error,
    );

    if (
      error?.message ===
        "O questionário não foi preenchido completamente." ||
      error?.message ===
        "Selecione pelo menos uma área de interesse." ||
      error?.message ===
        "Respostas do questionário não informadas."
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error:
        "Não foi possível gerar as recomendações.",
    });
  }
});

export { router as recomendacaoRoutes };