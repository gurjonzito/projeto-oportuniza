import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "../config/prisma";

const jwks = createRemoteJWKSet(
  new URL(process.env.NEON_AUTH_JWKS_URL!),
);

// Issuer é a origem do Neon Auth (sem o path /auth)
const issuer = new URL(process.env.NEON_AUTH_BASE_URL!).origin;

export async function userAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });

    const userId = payload.sub as string;
    const userEmail = payload.email as string;
    const userName =
      (payload.name as string) ?? userEmail?.split("@")[0] ?? "Usuário";

    if (!userId || !userEmail) {
      return res.status(401).json({ error: "Token sem dados de usuário" });
    }

    // ─── Sincroniza: cria a linha na tabela `users` apenas se não existir ─
    // `update: {}` significa "não altera nada se já existir" — preserva
    // mudanças feitas pelo próprio usuário via PUT /user/me
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: userName,
        email: userEmail,
        emailVerified: (payload as any).emailVerified ?? false,
        image: (payload as any).image ?? null,
      },
    });

    (req as any).user = {
      id: userId,
      email: userEmail,
      name: userName,
      image: (payload as any).image ?? null,
      emailVerified: (payload as any).emailVerified ?? false,
    };

    next();
  } catch (error) {
    console.error("Erro ao validar JWT:", error);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}