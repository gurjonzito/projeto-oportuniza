import { Router } from "express";

import { userAuth } from "../middleware/userAuth";

import {
  listarTrilhasEmAndamentoService,
  buscarTrilhaProgressService,
  marcarVideoConcluidoService,
  desmarcarVideoConcluidoService,
} from "../services/trilhaProgressService";

const router = Router();

router.get(
  "/progresso",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = (req as any).user.id;

      const progressos =
        await listarTrilhasEmAndamentoService(userId);

      res.json(progressos);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:slug/progresso",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = (req as any).user.id;
      const slug = req.params.slug as string;

      const progresso =
        await buscarTrilhaProgressService(
          userId,
          slug
        );

      if (!progresso) {
        return res.status(404).json({
          error: "Progresso não encontrado.",
        });
      }

      res.json(progresso);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:slug/progresso/videos/:videoId",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = (req as any).user.id;

      const slug = req.params.slug as string;
      const videoId = req.params.videoId as string;

      const progresso =
        await marcarVideoConcluidoService(
          userId,
          slug,
          videoId
        );

      res.json(progresso);
    } catch (error: any) {
      if (
        error?.message === "Trilha não encontrada." ||
        error?.message ===
          "Vídeo não pertence a esta trilha."
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      next(error);
    }
  }
);

router.delete(
  "/:slug/progresso/videos/:videoId",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = (req as any).user.id;

      const slug = req.params.slug as string;
      const videoId = req.params.videoId as string;

      const progresso =
        await desmarcarVideoConcluidoService(
          userId,
          slug,
          videoId
        );

      res.json(progresso);
    } catch (error: any) {
      if (
        error?.message === "Trilha não encontrada." ||
        error?.message ===
          "Vídeo não pertence a esta trilha."
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      next(error);
    }
  }
);

export { router as trilhaProgressRoutes };