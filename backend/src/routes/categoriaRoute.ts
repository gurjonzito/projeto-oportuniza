import { Router } from 'express'
import { getCategorias } from '../repositories/categoriaRepository'

const router = Router()

/*
  LISTAR CATEGORIAS
*/

router.get('/', async (req, res, next) => {
  try {
    const categorias = await getCategorias()
    res.json({ categorias })
  } catch (err) {
    next(err)
  }
})

export { router as categoriaRoutes }