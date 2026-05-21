import { Router } from "express";
import { searchVideos } from "../services/videoService";

const router = Router();

/*
  MAPEAMENTO
*/

function mapVideo(v: any) {
  return {
    id: v.id,
    videoId: v.youtubeVideoId,
    title: v.titulo,
    channel: v.canal?.nome ?? "",
    thumbnail: v.thumbnailUrl,
    duration: v.duracao ?? "",
    summary: v.descricao,
    category: v.categoria ?? "geral",
  };
}

/*
  GET /videos
*/

router.get("/", async (req, res, next) => {
  try {
    const query = (req.query.q as string) || "mercado de trabalho jovem";

    const videos = await searchVideos(query);

    res.json({ videos: videos.map(mapVideo) });
  } catch (err) {
    next(err);
  }
});

/*
  GET /videos/search
*/

router.get("/search", async (req, res, next) => {
  try {
    const query = (req.query.q as string) || "mercado de trabalho jovem";

    const videos = await searchVideos(query);

    res.json({ videos: videos.map(mapVideo) });
  } catch (err) {
    next(err);
  }
});

export { router as videoRoutes };