import { prisma } from "../config/prisma";
import { buscarVideos } from "./youtubeService";

export async function descobrirVideosService(termo: string) {
  if (!termo.trim()) throw new Error("Informe um termo para buscar.");

  // Chama o YouTube (não salva nada)
  const videos = await buscarVideos(termo.trim());

  // Marca o que já existe no banco
  const ids = videos.map((v) => v.youtubeVideoId);
  const existentes = await prisma.video.findMany({
    where: { youtubeVideoId: { in: ids } },
    select: { youtubeVideoId: true, isCurated: true },
  });

  const mapa = new Map(
    existentes.map((v) => [v.youtubeVideoId, v.isCurated])
  );

  return videos.map((v) => ({
    ...v,
    jaExiste: mapa.has(v.youtubeVideoId),
    curado: mapa.get(v.youtubeVideoId) ?? false,
  }));
}

export async function curarVideoService(candidato: {
  youtubeVideoId: string;
  titulo: string;
  descricao?: string;
  thumbnail?: string;
  channelId?: string;
  canal?: string;
  duracaoSegundos?: number;
}) {
  if (!candidato.channelId) {
    throw new Error("Vídeo sem channelId — não é possível vincular.");
  }

  // Garante o canal
  let canal = await prisma.canal.findUnique({
    where: { youtubeChannelId: candidato.channelId },
  });

  if (!canal) {
    canal = await prisma.canal.create({
      data: {
        youtubeChannelId: candidato.channelId,
        nome: candidato.canal ?? "Canal",
        descricao: "",
      },
    });
  }

  // Upsert com isCurated: true
  return prisma.video.upsert({
    where: { youtubeVideoId: candidato.youtubeVideoId },
    update: {
      titulo: candidato.titulo,
      descricao: candidato.descricao,
      thumbnailUrl: candidato.thumbnail,
      duracaoSegundos: candidato.duracaoSegundos,
      canalId: canal.id,
      isCurated: true,
    },
    create: {
      youtubeVideoId: candidato.youtubeVideoId,
      titulo: candidato.titulo,
      descricao: candidato.descricao,
      thumbnailUrl: candidato.thumbnail,
      duracaoSegundos: candidato.duracaoSegundos,
      canalId: canal.id,
      tags: [],
      isCurated: true,
    },
  });
}