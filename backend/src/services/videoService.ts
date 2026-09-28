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

// ⚠️ Ajuste o caminho do prisma conforme seu projeto
// (pode ser "../config/prisma" ou "../lib/prisma")
import { prisma } from "../config/prisma";

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