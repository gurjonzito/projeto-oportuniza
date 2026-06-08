import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { searchVideos } from '../services/videoService'
import { updateVideoCurated, updateVideoTags } from '../repositories/videoRepository'

const router = Router()

function mapVideo(v: any) {
  return {
    id: v.id,
    videoId: v.youtubeVideoId,
    title: v.titulo,
    channel: v.canal?.nome ?? '',
    thumbnail: v.thumbnailUrl,
    duration: v.duracao ?? '',
    summary: v.descricao,
    category: v.categoria ?? 'geral',
    isCurated: v.isCurated,
    tags: v.tags ?? [],
  }
}

router.get('/', async (req, res, next) => {
  try {
    const query = (req.query.q as string) || 'mercado de trabalho jovem'
    const videos = await searchVideos(query)
    res.json({ videos: videos.map(mapVideo) })
  } catch (err) { next(err) }
})

router.get('/search', async (req, res, next) => {
  try {
    const query = (req.query.q as string) || 'mercado de trabalho jovem'
    const videos = await searchVideos(query)
    res.json({ videos: videos.map(mapVideo) })
  } catch (err) { next(err) }
})

router.patch('/:id/curated', authMiddleware, async (req, res, next) => {
  try {
    const video = await updateVideoCurated(req.params.id as string, req.body.isCurated)
    res.json({ video })
  } catch (err) { next(err) }
})

router.patch('/:id/tags', authMiddleware, async (req, res, next) => {
  try {
    const video = await updateVideoTags(req.params.id as string, req.body.tags)
    res.json({ video })
  } catch (err) { next(err) }
})

export { router as videoRoutes }