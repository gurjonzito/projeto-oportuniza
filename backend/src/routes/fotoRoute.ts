import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

import { userAuth } from "../middleware/userAuth";
import { prisma } from "../config/prisma";

const router = Router();

// =========================================================
// CONFIGURAÇÃO DO MULTER
// Armazena em memória para processar com o sharp antes de salvar
// =========================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },

  fileFilter(_req, file, callback) {
    const permitidos = ["image/jpeg", "image/png"];

    if (!permitidos.includes(file.mimetype)) {
      return callback(
        new Error("Apenas arquivos JPG e PNG são permitidos.")
      );
    }

    callback(null, true);
  },
});

// =========================================================
// DIRETÓRIO DE UPLOADS
// Ajuste o caminho conforme a estrutura do seu projeto.
// Se usar um serviço de storage (S3, Cloudflare R2 etc.),
// substitua a lógica de salvar arquivo pela do SDK do serviço.
// =========================================================

const UPLOADS_DIR = path.resolve(__dirname, "../../public/uploads/avatars");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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

      // Nome único para o arquivo: id do usuário + timestamp
      const nomeArquivo = `${usuario.id}-${Date.now()}.webp`;
      const caminhoArquivo = path.join(UPLOADS_DIR, nomeArquivo);

      // Redimensiona e converte para WebP com sharp
      // (menor peso, boa qualidade, compatível com todos os browsers modernos)
      await sharp(req.file.buffer)
        .resize(256, 256, {
          fit: "cover",        // recorta centralizado
          position: "center",
        })
        .webp({ quality: 85 })
        .toFile(caminhoArquivo);

      // URL pública da imagem
      // Ajuste o prefixo conforme o seu setup (domínio, CDN etc.)
      const urlFoto = `/uploads/avatars/${nomeArquivo}`;

      // Remove a foto antiga, se existir e não for uma URL externa (ex: Google)
      const usuarioAtual = await prisma.user.findUnique({
        where: { id: usuario.id },
        select: { image: true },
      });

      if (
        usuarioAtual?.image &&
        usuarioAtual.image.startsWith("/uploads/avatars/")
      ) {
        const caminhoAntigo = path.resolve(
          __dirname,
          "../../public",
          usuarioAtual.image.slice(1) // remove a barra inicial
        );

        fs.unlink(caminhoAntigo, (err) => {
          if (err) {
            // Não bloqueia a resposta se a remoção falhar
            console.warn("Aviso: não foi possível remover a foto antiga:", err.message);
          }
        });
      }

      // Atualiza a URL no banco
      const usuarioAtualizado = await prisma.user.update({
        where: { id: usuario.id },
        data: { image: urlFoto },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return res.json({
        message: "Foto atualizada com sucesso.",
        image: usuarioAtualizado.image,
      });
    } catch (err: any) {
      // Erros do multer (tamanho, tipo de arquivo)
      if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ error: err.message });
      }

      next(err);
    }
  }
);

export { router as fotoRoutes };