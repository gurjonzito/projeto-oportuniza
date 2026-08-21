import { Router } from "express";
import multer from "multer";
import sharp from "sharp";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { userAuth } from "../middleware/userAuth";
import { prisma } from "../config/prisma";

const router = Router();

// =========================================================
// CLIENTE R2
// =========================================================

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

// =========================================================
// MULTER
// =========================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const permitidos = ["image/jpeg", "image/png"];
    if (!permitidos.includes(file.mimetype)) {
      return callback(new Error("Apenas arquivos JPG e PNG são permitidos."));
    }
    callback(null, true);
  },
});

// =========================================================
// HELPERS
// =========================================================

export async function gerarPresignedUrl(key: string): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: URL_EXPIRY_SECONDS }
  );
}

function extrairKey(imageKey: string | null): string | null {
  if (!imageKey || imageKey.startsWith("/uploads/")) return null;
  return imageKey;
}

async function deletarDoR2(imageKey: string) {
  const key = extrairKey(imageKey);
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err: any) {
    console.warn("Aviso: não foi possível remover foto antiga do R2:", err.message);
  }
}

// =========================================================
// POST /user/me/foto
// =========================================================

router.post(
  "/me/foto",
  userAuth,
  upload.single("foto"),
  async (req, res, next) => {
    try {
      const usuario = (req as any).user;

      if (!usuario?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const buffer = await sharp(req.file.buffer)
        .resize(256, 256, { fit: "cover", position: "center" })
        .webp({ quality: 85 })
        .toBuffer();

      const key = `avatars/${usuario.id}-${Date.now()}.webp`;

      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "image/webp",
        })
      );

      // Remove foto anterior do R2
      const usuarioAtual = await prisma.user.findUnique({
        where: { id: usuario.id },
        select: { imageKey: true },
      });

      if (usuarioAtual?.imageKey) {
        await deletarDoR2(usuarioAtual.imageKey);
      }

      const presignedUrl = await gerarPresignedUrl(key);
      const imageUrlExpiresAt = new Date(Date.now() + URL_EXPIRY_SECONDS * 1000);

      const usuarioAtualizado = await prisma.user.update({
        where: { id: usuario.id },
        data: {
          imageKey: key,        // corrigido: inicializador explícito
          image: presignedUrl,
          imageUrlExpiresAt,
        },
        select: { id: true, name: true, email: true, image: true },
      });

      return res.json({
        message: "Foto atualizada com sucesso.",
        image: usuarioAtualizado.image,
      });
    } catch (err: any) {
      if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }
);

export { router as fotoRoutes };