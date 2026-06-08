import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret as string)
    ;(req as any).admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}