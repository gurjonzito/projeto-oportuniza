import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "./betterAuth";

export async function userAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    (req as any).user = session.user;
    (req as any).session = session.session;

    next();
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);

    return res.status(401).json({
      error: "Sessão inválida ou expirada",
    });
  }
}