import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  listarRecursosService,
  criarRecursoService,
  editarRecursoService,
  deletarRecursoService,
} from '../services/recursoService'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const recursos = await listarRecursosService()
    res.json({ recursos })
  } catch (err) { next(err) }
})

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const recurso = await criarRecursoService(req.body)
    res.status(201).json({ recurso })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const recurso = await editarRecursoService(req.params.id as string, req.body)
    res.json({ recurso })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await deletarRecursoService(req.params.id as string)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

export { router as recursoRoutes }