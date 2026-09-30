import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'

import {
  searchVideos,
  descobrirVideosService,
  curarVideoService,
} from '../services/videoService'

import {
  updateVideoCurated,
  updateVideoTags,
  listarTodosVideos,
  listarVideosCurados, // ⚠️ nova importação
} from '../repositories/videoRepository'

const router = Router()

function mapVideo(v: any) {
  return {
    id: v.id,
    videoId: v.youtubeVideoId,
    youtubeVideoId: v.youtubeVideoId,
    title: v.titulo,
    titulo: v.titulo,
    channel: v.canal?.nome ?? '',
    canal: v.canal ? { nome: v.canal.nome } : undefined,
    thumbnail: v.thumbnailUrl,
    thumbnailUrl: v.thumbnailUrl,
    duration: v.duracao ?? '',
    summary: v.descricao,
    descricao: v.descricao,
    category: v.categoria ?? 'geral',
    isCurated: v.isCurated,
    tags: v.tags ?? [],
  }
}

// ─── Rotas PÚBLICAS ──────────────────────────────────────────────────────

// ⚠️ ALTERADO: se tiver query, busca no YouTube; se não, lista todos os curados
router.get('/', async (req, res, next) => {
  try {
    const query = req.query.q as string | undefined

    if (query && query.trim()) {
      const videos = await searchVideos(query.trim())
      return res.json({ videos: videos.map(mapVideo) })
    }

    // Sem query → retorna todos os vídeos curados do banco
    const videos = await listarVideosCurados()
    return res.json({ videos: videos.map(mapVideo) })
  } catch (err) {
    next(err)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    const query = (req.query.q as string) || ''

    if (!query.trim()) {
      // Sem query → retorna todos os curados
      const videos = await listarVideosCurados()
      return res.json({ videos: videos.map(mapVideo) })
    }

    const videos = await searchVideos(query.trim())
    res.json({ videos: videos.map(mapVideo) })
  } catch (err) {
    next(err)
  }
})

// ─── Rotas ADMIN ─────────────────────────────────────────────────────────
// ⚠️ As rotas estáticas (/descobrir, /curar, /admin/all) vêm ANTES de /:id

// Lista todos os vídeos (curados e não curados)
router.get('/admin/all', authMiddleware, async (req, res, next) => {
  try {
    const videos = await listarTodosVideos()
    res.json({ videos: videos.map(mapVideo) })
  } catch (err) {
    next(err)
  }
})

// Descobrir vídeos por termo nos canais cadastrados (NÃO salva nada)
router.get('/descobrir', authMiddleware, async (req, res) => {
  try {
    const termo = (req.query.termo as string) ?? ''
    const videos = await descobrirVideosService(termo)
    res.json({ videos })
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao buscar vídeos.' })
  }
})

// Curar um vídeo — salva no banco com isCurated: true
router.post('/curar', authMiddleware, async (req, res) => {
  try {
    const video = await curarVideoService(req.body)
    res.status(201).json({ video })
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao curar vídeo.' })
  }
})

// ─── Rotas com :id ──────────────────────────────────────────────────────

router.patch('/:id/curated', authMiddleware, async (req, res, next) => {
  try {
    const video = await updateVideoCurated(
      req.params.id as string,
      req.body.isCurated
    )
    res.json({ video })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/tags', authMiddleware, async (req, res, next) => {
  try {
    const video = await updateVideoTags(
      req.params.id as string,
      req.body.tags
    )
    res.json({ video })
  } catch (err) {
    next(err)
  }
})

export { router as videoRoutes }