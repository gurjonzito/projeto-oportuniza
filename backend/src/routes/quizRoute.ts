import { Router } from "express";

import {
  gerarQuiz,
  corrigirQuiz,
  corrigirQuizAnonimo
} from "../services/quizService";

import { userAuth } from "../middleware/userAuth";

const router = Router();

/**
 * ============================================================
 * GERAR / BUSCAR QUIZ DE UM VÍDEO
 * ============================================================
 *
 * GET /quiz/:videoId
 *
 * Não exige login para visualizar o quiz.
 */
router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    if (typeof videoId !== "string") {
      return res.status(400).json({
        error: "ID do vídeo inválido.",
      });
    }

    const quiz = await gerarQuiz(videoId);

    return res.json(quiz);
  } catch (error: any) {
    console.error("Erro ao gerar quiz:", error);

    if (error?.message === "Vídeo não encontrado.") {
      return res.status(404).json({
        error: error.message,
      });
    }

    if (
      error?.message ===
      "O resumo do vídeo precisa ser gerado antes do quiz."
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao gerar quiz.",
    });
  }
});

/**
 * ============================================================
 * CORRIGIR QUIZ
 * ============================================================
 *
 * POST /quiz/:quizId/corrigir
 *
 * Requer usuário autenticado.
 *
 * Body:
 * {
 *   "respostas": [
 *     {
 *       "questionId": "...",
 *       "optionId": "..."
 *     }
 *   ]
 * }
 */
router.post(
  "/:quizId/corrigir",
  userAuth,
  async (req, res) => {
    try {
      const { quizId } = req.params;

      if (typeof quizId !== "string") {
        return res.status(400).json({
          error: "ID do quiz inválido.",
        });
      }

      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const { respostas } = req.body;

      if (!Array.isArray(respostas)) {
        return res.status(400).json({
          error: "Respostas inválidas.",
        });
      }

      const resultado = await corrigirQuiz(
        quizId,
        userId,
        respostas
      );

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao corrigir quiz:", error);

      if (
        error?.message ===
        "Quiz não encontrado."
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (
        error?.message ===
        "Respostas inválidas."
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (
        error?.message?.includes(
          "todas devem ser respondidas"
        )
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (
        error?.message?.includes(
          "não foi respondida"
        )
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (
        error?.message?.includes(
          "Alternativa inválida"
        )
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro ao corrigir quiz.",
      });
    }
  }
);

router.post("/:quizId/corrigir-anonimo", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { respostas } = req.body;

    if (!Array.isArray(respostas)) {
      return res.status(400).json({ error: "Respostas inválidas." });
    }

    const resultado = await corrigirQuizAnonimo(quizId, respostas);
    return res.json(resultado);
  } catch (error: any) {
    console.error("Erro ao corrigir quiz anônimo:", error);

    const mensagensValidacao = [
      "Quiz não encontrado.",
      "Respostas inválidas.",
    ];

    if (mensagensValidacao.includes(error?.message)) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao corrigir quiz." });
  }
});

export { router as quizRoutes };