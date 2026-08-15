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

export async function searchVideos(query: string) {
  const now = new Date();

  const cache = await findCacheByTerm(query);

  if (cache && cache.expiraEm && cache.expiraEm > now) {
    return findCuratedVideosByIds(cache.resultadoIds); // ← só curados do cache
  }

  const youtubeVideos = await buscarVideos(query);
  const savedVideos = [];

  for (const item of youtubeVideos) {
    const canal = await findCanalByYoutubeId(item.channelId);
    if (!canal) continue;

    let video = await findVideoByYoutubeId(item.youtubeVideoId);

    if (!video) {
      video = await createVideo({
        youtubeVideoId: item.youtubeVideoId,
        canalId: canal.id,
        titulo: item.titulo,
        descricao: item.descricao,
        thumbnailUrl: item.thumbnail,
        tags: [],
        publicadoEm: new Date(item.publishedAt),
        cacheExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    savedVideos.push(video);
  }

  if (savedVideos.length === 0) return [];

  const resultIds = savedVideos.map((v) => v.id);

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

  return findCuratedVideosByIds(resultIds); // ← só curados no retorno final
}