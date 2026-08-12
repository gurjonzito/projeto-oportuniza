import { Router } from "express";
import { gerarResumo } from "../services/resumoService";

const router = Router();

router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const resumo = await gerarResumo(videoId);
    res.json({ resumo });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    res.status(500).json({ error: "Erro ao gerar resumo." });
  }
});

export { router as resumoRoutes };