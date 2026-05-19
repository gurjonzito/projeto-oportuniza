import { Router } from 'express'
import { buscarVideos, buscarDetalhesVideo, buscarVideosDoCanal } from '../services/youtubeService'

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
    const detalhes = await buscarDetalhesVideo(req.params.videoId)
    res.json(detalhes)
  } catch (err) { next(err) }
})

router.get('/canal/:channelId', async (req, res, next) => {
  try {
    const videos = await buscarVideosDoCanal(req.params.channelId)
    res.json({ total: videos.length, videos })
  } catch (err) { next(err) }
})

export { router as youtubeRoutes }