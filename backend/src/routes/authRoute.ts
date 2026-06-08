import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

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

  console.log('RECEBIDO:', { email, password })
  console.log('ESPERADO:', { email: adminEmail, password: adminPassword })
  console.log('email match:', email.trim() === adminEmail.trim())
  console.log('password match:', password.trim() === adminPassword.trim())
  console.log('email lengths:', email.length, adminEmail.trim().length)
  console.log('password lengths:', password.length, adminPassword.trim().length)

  if (email.trim() !== adminEmail.trim() || password.trim() !== adminPassword.trim()) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    jwtSecret as string,
    { expiresIn: '8h' }
  )

  return res.json({ token })
})

export { router as authRoutes }