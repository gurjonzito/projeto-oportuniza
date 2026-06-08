import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  importarPlaylist,
  listarTrilhas,
  buscarTrilha,
  listarTodasTrilhas,
  criarTrilha,
  editarTrilha,
  deletarTrilha,
  reordenarTrilhas
} from '../controllers/playlistController'

const router = Router()

router.patch(
  '/reorder',
  authMiddleware,
  reordenarTrilhas
)

router.post('/import', authMiddleware, importarPlaylist)
router.get('/admin', authMiddleware, listarTodasTrilhas)
router.get('/', listarTrilhas)
router.get('/:slug', buscarTrilha)
router.post('/', authMiddleware, criarTrilha)
router.put('/:id', authMiddleware, editarTrilha)
router.delete('/:id', authMiddleware, deletarTrilha)

export default router