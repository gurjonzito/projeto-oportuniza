import { Router } from 'express'
import { buscarVideos, buscarDetalhesVideo, buscarVideosDoCanal } from '../services/youtubeService'
import { findVideoByYoutubeIdWithDetails } from '../repositories/videoRepository'

const router = Router()

router.get('/buscar', async (req, res, next) => {
  try {
    const q = req.query.q as string
    if (!q) return res.status(400).json({ erro: 'Parâmetro q obrigatório' })
    const videos = await buscarVideos(q)
    res.json({ total: videos.length, videos })
  } catch (err) { next(err) }
})

router.get('/detalhes/:videoId', async (req, res, next) => {
  try {
    const { videoId } = req.params

    // 1. Busca no banco
    const videoBanco = await findVideoByYoutubeIdWithDetails(videoId)

    if (videoBanco) {
      return res.json({
        youtubeVideoId: videoBanco.youtubeVideoId,
        titulo: videoBanco.titulo,
        canal: videoBanco.canal?.nome ?? '',
        duracaoSegundos: videoBanco.duracaoSegundos ?? null,
      })
    }

    // 2. Não achou no banco → busca no YouTube
    const detalhesYT = await buscarDetalhesVideo(videoId)

    if (!detalhesYT) {
      return res.status(404).json({ erro: 'Vídeo não encontrado' })
    }

    return res.json({
      youtubeVideoId: detalhesYT.youtubeVideoId,
      titulo: detalhesYT.titulo,
      canal: detalhesYT.canal,
      duracaoSegundos: null, // YouTube retorna ISO, não segundos
      duracaoISO: detalhesYT.duracaoISO ?? '',
    })
  } catch (err) { next(err) }
})

router.get('/canal/:channelId', async (req, res, next) => {
  try {
    const videos = await buscarVideosDoCanal(req.params.channelId)
    res.json({ total: videos.length, videos })
  } catch (err) { next(err) }
})

export { router as youtubeRoutes }