import {
  findCacheByTerm,
  createCache,
  updateCache
} from '../repositories/buscaCacheRepository'

import {
  findVideoByYoutubeId,
  createVideo,
  findVideosByIds
} from '../repositories/videoRepository'

import {
  findCanalByYoutubeId,
  createCanal
} from '../repositories/canalRepository'

import { buscarVideos }
  from './youtubeService'

export async function searchVideos(
  query: string
) {

  /*
    DATA ATUAL
  */

  const now = new Date()

  /*
    1. VERIFICA CACHE
  */

  const cache =
    await findCacheByTerm(query)

  /*
    2. CACHE EXISTE E ESTÁ VÁLIDO
  */

  if (
    cache &&
    cache.expiraEm &&
    cache.expiraEm > now
  ) {

    console.log('CACHE VÁLIDO')

    /*
      BUSCA VÍDEOS PELOS IDS
    */

    const cachedVideos =
      await findVideosByIds(
        cache.resultadoIds
      )

    return cachedVideos
  }

  console.log(
    'CACHE EXPIRADO OU INEXISTENTE'
  )

  /*
    3. CHAMA YOUTUBE API
  */

  const youtubeVideos =
    await buscarVideos(query)

  const savedVideos = []

  /*
    4. PERCORRE VÍDEOS
  */

  for (const item of youtubeVideos) {

    const videoId =
      item.id.videoId

    const snippet =
      item.snippet

    /*
      5. VERIFICA SE CANAL EXISTE
    */

    let canal =
      await findCanalByYoutubeId(
        snippet.channelId
      )

    /*
      6. CRIA CANAL SE NÃO EXISTIR
    */

    if (!canal) {

      canal = await createCanal({

        youtubeChannelId:
          snippet.channelId,

        nome:
          snippet.channelTitle,

        descricao: '',

        thumbnailUrl:
          snippet.thumbnails.high.url
      })
    }

    /*
      7. VERIFICA SE VÍDEO EXISTE
    */

    let video =
      await findVideoByYoutubeId(
        videoId
      )

    /*
      8. CRIA VÍDEO SE NÃO EXISTIR
    */

    if (!video) {

      video = await createVideo({

        youtubeVideoId:
          videoId,

        canalId:
          canal.id,

        titulo:
          snippet.title,

        descricao:
          snippet.description,

        thumbnailUrl:
          snippet.thumbnails.high.url,

        tags: [],

        publicadoEm:
          new Date(
            snippet.publishedAt
          ),

        cacheExpiraEm:
          new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
          )
      })
    }

    savedVideos.push(video)
  }

  /*
    9. IDS DOS VÍDEOS
  */

  const resultIds =
    savedVideos.map(
      video => video.id
    )

  /*
    10. ATUALIZA CACHE
  */

  if (cache) {

    await updateCache(
      cache.id,
      {

        resultadoIds:
          resultIds,

        buscadoEm:
          now,

        expiraEm:
          new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
          )
      }
    )

  } else {

    /*
      11. CRIA CACHE
    */

    await createCache({

      termo: query,

      resultadoIds:
        resultIds,

      buscadoEm:
        now,

      expiraEm:
        new Date(
          Date.now() +
          7 * 24 * 60 * 60 * 1000
        )
    })
  }

  /*
    12. RETORNA VÍDEOS
  */

  return savedVideos
}