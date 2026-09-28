import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
  new URL(process.env.NEON_AUTH_JWKS_URL!)
);

const issuer = new URL(process.env.NEON_AUTH_BASE_URL!).origin;

export async function userAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });

    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch (error) {
    console.error("Erro ao validar JWT:", error);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}