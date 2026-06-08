import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const COOKIE_NAME = 'admin_token'
const IS_PROD = process.env.NODE_ENV === 'production'

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  if (!adminEmail || !adminPassword || !jwtSecret) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta' })
  }

  if (email.trim() !== adminEmail.trim() || password.trim() !== adminPassword.trim()) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    jwtSecret,
    { expiresIn: '2h' }
  )

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                // JS não consegue ler
    secure: IS_PROD,               // HTTPS only em produção
    sameSite: IS_PROD ? 'none' : 'lax', // cross-site em produção
    maxAge: 2 * 60 * 60 * 1000, 
  })

  return res.json({ ok: true })
})

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  })
  return res.json({ ok: true })
})

router.get('/me', authMiddleware, (req, res) => {
  return res.json({ admin: (req as any).admin })
})

export { router as authRoutes }