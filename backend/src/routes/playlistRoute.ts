import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'

import {
  importarPlaylistService,
  listarTrilhasService,
  buscarTrilhaService,
  sincronizarPlaylistService,
} from '../services/playlistService'

import {
  listarTodasTrilhasService,
  criarTrilhaService,
  editarTrilhaService,
  deletarTrilhaService,
  reordenarTrilhasService,
} from '../services/trilhaService'

const router = Router()

// ─── Sincronização (rota estática antes de /:id) ─────────────────────────
router.post('/:id/sync', authMiddleware, async (req, res) => {
  try {
    const resultado = await sincronizarPlaylistService(req.params.id as string)
    res.json(resultado)
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao sincronizar playlist.' })
  }
})

// ─── Reorder ──────────────────────────────────────────────────────────────
router.patch('/reorder', authMiddleware, async (req, res, next) => {
  try {
    const { trilhas } = req.body as {
      trilhas: { id: string; ordem: number }[]
    }
    if (!Array.isArray(trilhas)) {
      return res.status(400).json({ erro: 'Payload inválido.' })
    }
    await reordenarTrilhasService(trilhas)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── Import ───────────────────────────────────────────────────────────────
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const { url, categoriaId } = req.body as {
      url: string
      categoriaId: string
    }
    const trilha = await importarPlaylistService(url, categoriaId)
    res.status(201).json({ trilha })
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Erro ao importar playlist.' })
  }
})

// ─── Listagens ────────────────────────────────────────────────────────────
router.get('/admin', authMiddleware, async (req, res, next) => {
  try {
    const trilhas = await listarTodasTrilhasService()
    res.json({ trilhas })
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const trilhas = await listarTrilhasService()
    res.json({ trilhas })
  } catch (err) {
    next(err)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const trilha = await buscarTrilhaService(req.params.slug as string)
    if (!trilha) {
      return res.status(404).json({ erro: 'Trilha não encontrada.' })
    }
    res.json({ trilha })
  } catch (err) {
    next(err)
  }
})

// ─── CRUD ─────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const trilha = await criarTrilhaService(req.body)
    res.status(201).json({ trilha })
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao criar trilha.' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await editarTrilhaService(req.params.id as string, req.body)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao editar trilha.' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await deletarTrilhaService(req.params.id as string)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ erro: err.message ?? 'Erro ao remover trilha.' })
  }
})

export default router