import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  listarCategoriasService,
  criarCategoriaService,
  editarCategoriaService,
  deletarCategoriaService,
  reordenarCategoriasService,
} from '../services/categoriaService'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const categorias = await listarCategoriasService()
    res.json({ categorias })
  } catch (err) { next(err) }
})

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const categoria = await criarCategoriaService(req.body)
    res.status(201).json({ categoria })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

// ⚠️ Antes de '/:id'
router.patch('/reorder', authMiddleware, async (req, res) => {
  try {
    const { categorias } = req.body as {
      categorias: { id: string; ordem: number }[]
    }

    if (!Array.isArray(categorias)) {
      return res.status(400).json({ erro: 'Payload inválido.' })
    }

    await reordenarCategoriasService(categorias)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const categoria = await editarCategoriaService(req.params.id as string, req.body)
    res.json({ categoria })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await deletarCategoriaService(req.params.id as string)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

export { router as categoriaRoutes }