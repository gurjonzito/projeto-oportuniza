import {
  findCacheByTerm,
  createCache,
  updateCache,
} from "../repositories/buscaCacheRepository";

import {
  findVideoByYoutubeId,
  createVideo,
  findVideosByIds,
} from "../repositories/videoRepository";

import { findCanalByYoutubeId } from "../repositories/canalRepository";

import { buscarVideos } from "./youtubeService";

export async function searchVideos(query: string) {
  /*
    DATA ATUAL
  */

  const now = new Date();

  /*
    1. VERIFICA CACHE
  */

  const cache = await findCacheByTerm(query);

  /*
    2. CACHE VÁLIDO
  */

  if (cache && cache.expiraEm && cache.expiraEm > now) {
    console.log("CACHE VÁLIDO");

    /*
      BUSCA VÍDEOS SALVOS
    */

    const cachedVideos = await findVideosByIds(cache.resultadoIds);

    return cachedVideos;
  }

  console.log("CACHE EXPIRADO OU INEXISTENTE");

  /*
    3. BUSCA YOUTUBE
  */

  const youtubeVideos = await buscarVideos(query);

  const savedVideos = [];

  /*
    4. PERCORRE VÍDEOS
  */

  for (const item of youtubeVideos) {
    /*
      VERIFICA CANAL — ignora vídeos de canais não cadastrados
    */

    const canal = await findCanalByYoutubeId(item.channelId);

    if (!canal) {
      console.log(`Canal ignorado (não cadastrado): ${item.canal}`);

      continue;
    }

    /*
      VERIFICA VÍDEO
    */

    let video = await findVideoByYoutubeId(item.youtubeVideoId);

    /*
      CRIA VÍDEO
    */

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

  /*
    5. NENHUM VÍDEO DOS CANAIS CADASTRADOS
  */

  if (savedVideos.length === 0) {
    console.log("Nenhum vídeo encontrado dos canais cadastrados");

    return [];
  }

  /*
    6. IDS DOS VÍDEOS
  */

  const resultIds = savedVideos.map((video) => video.id);

  /*
    7. ATUALIZA CACHE
  */

  if (cache) {
    await updateCache(cache.id, {
      resultadoIds: resultIds,

      buscadoEm: now,

      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  } else {
    /*
      8. CRIA CACHE
    */

    await createCache({
      termo: query,

      resultadoIds: resultIds,

      buscadoEm: now,

      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  /*
    9. RETORNA
  */

  return savedVideos;
}
