import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { listarCanaisService, criarCanalService, editarCanalService, deletarCanalService } from '../services/canalService'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const canais = await listarCanaisService()
    res.json({ canais })
  } catch (err) { next(err) }
})

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const canal = await criarCanalService(req.body)
    res.status(201).json({ canal })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const canal = await editarCanalService(req.params.id as string, req.body)
    res.json({ canal })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await deletarCanalService(req.params.id as string)
    res.json({ ok: true })
  } catch (err: any) { res.status(400).json({ erro: err.message }) }
})

export { router as canalRoutes }