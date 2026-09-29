import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_token";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      role: string;
    };

    if (payload.role !== "admin") {
      return res.status(401).json({ error: "Acesso restrito ao admin" });
    }

    (req as any).admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}