import {
  findCacheByTerm,
  createCache,
  updateCache,
} from "../repositories/buscaCacheRepository";

import {
  findVideoByYoutubeId,
  createVideo,
  findCuratedVideosByIds,
} from "../repositories/videoRepository";

import { findCanalByYoutubeId } from "../repositories/canalRepository";
import { buscarVideos } from "./youtubeService";

import { prisma } from "../config/prisma";

// ─── BUSCA PÚBLICA ────────────────────────────────────────────────────────

/**
 * Busca pública de vídeos.
 *
 * Estratégia:
 *  1. Verifica cache por termo.
 *  2. Se não há cache, chama o YouTube (via buscarVideos).
 *  3. Cruza os resultados do YouTube com os vídeos JÁ CURADOS no banco.
 *  4. NÃO salva vídeos novos — quem salva é o admin ao curar.
 *  5. Atualiza o cache com os IDs curados encontrados.
 */
export async function searchVideos(query: string) {
  const now = new Date();

  // 1. Cache
  const cache = await findCacheByTerm(query);

  if (cache && cache.expiraEm && cache.expiraEm > now) {
    return findCuratedVideosByIds(cache.resultadoIds);
  }

  // 2. Busca no YouTube (não salva nada)
  const youtubeVideos = await buscarVideos(query);

  if (youtubeVideos.length === 0) {
    // Salva cache vazio para não bater na API do YouTube à toa
    if (cache) {
      await updateCache(cache.id, {
        resultadoIds: [],
        buscadoEm: now,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } else {
      await createCache({
        termo: query,
        resultadoIds: [],
        buscadoEm: now,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
    return [];
  }

  // 3. Cruza com o que já está curado no banco
  const ids = youtubeVideos.map((v) => v.youtubeVideoId);

  const curados = await prisma.video.findMany({
    where: {
      youtubeVideoId: { in: ids },
      isCurated: true,
    },
    select: { id: true },
  });

  const resultIds = curados.map((v) => v.id);

  // 4. Atualiza / cria cache
  if (cache) {
    await updateCache(cache.id, {
      resultadoIds: resultIds,
      buscadoEm: now,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  } else {
    await createCache({
      termo: query,
      resultadoIds: resultIds,
      buscadoEm: now,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  // 5. Retorna apenas os curados
  return findCuratedVideosByIds(resultIds);
}

// ─── DESCOBERTA (ADMIN) ───────────────────────────────────────────────────

/**
 * Descobre vídeos no YouTube para um termo, sem salvar nada no banco.
 * Cruza o resultado com o que já existe para marcar quais já foram curados.
 *
 * Usado pelo endpoint GET /videos/descobrir.
 */
export async function descobrirVideosService(termo: string) {
  if (!termo.trim()) {
    throw new Error("Informe um termo para buscar.");
  }

  // 1. Chama o YouTube (não salva nada)
  const videos = await buscarVideos(termo.trim());

  if (videos.length === 0) return [];

  // 2. Marca o que já existe no banco
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

// ─── CURADORIA (ADMIN) ────────────────────────────────────────────────────

/**
 * Salva um vídeo no banco com isCurated: true.
 * Garante que o canal exista antes de vincular o vídeo.
 *
 * Usado pelo endpoint POST /videos/curar.
 */
export async function curarVideoService(candidato: {
  youtubeVideoId: string;
  titulo: string;
  descricao?: string;
  thumbnail?: string;
  channelId?: string;
  canal?: string;
  duracaoSegundos?: number;
}) {
  if (!candidato.youtubeVideoId) {
    throw new Error("youtubeVideoId é obrigatório.");
  }

  if (!candidato.channelId) {
    throw new Error(
      "Vídeo sem channelId — não é possível vincular a um canal."
    );
  }

  // 1. Garante que o canal existe
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

  // 2. Upsert do vídeo já marcado como curado
  const video = await prisma.video.upsert({
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
    include: {
      canal: { select: { id: true, nome: true, thumbnailUrl: true } },
    },
  });

  return video;
}