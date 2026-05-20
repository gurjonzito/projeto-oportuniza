import { prisma } from "../config/prisma";

import { buscarPlaylist, buscarVideosPlaylist } from "./youtubeService";

import { extractPlaylistId } from "../utils/extractPlaylistId";

import { slugify } from "../utils/slugify";

export async function importarPlaylistService(
  url: string,
  categoriaId: string,
) { console.log("URL RECEBIDA NO SERVICE:", url);
  /*
    EXTRAI ID
  */

  const playlistId = extractPlaylistId(url);
  console.log("PLAYLIST ID EXTRAÍDO:", playlistId);

  if (!playlistId) {
    throw new Error("Playlist inválida");
  }

  /*
    VERIFICA EXISTÊNCIA
  */

  const existingTrilha = await prisma.trilha.findFirst({
    where: {
      youtubePlaylistId: playlistId,
    },
  });

  if (existingTrilha) {
    throw new Error("Playlist já importada");
  }

  /*
    BUSCA PLAYLIST
  */

  const playlistData = await buscarPlaylist(playlistId);

  /*
    BUSCA VÍDEOS
  */

  const videosData = await buscarVideosPlaylist(playlistId);

  /*
    DADOS CANAL
  */

  const firstVideo = videosData[0];

  const youtubeChannelId =
    firstVideo?.snippet?.videoOwnerChannelId || "unknown";

  const channelName =
    firstVideo?.snippet?.videoOwnerChannelTitle ||
    firstVideo?.snippet?.channelTitle ||
    "Canal";

  /*
    VERIFICA CANAL
  */

  let canal = await prisma.canal.findUnique({
    where: {
      youtubeChannelId,
    },
  });

  /*
    CRIA CANAL
  */

  if (!canal) {
    canal = await prisma.canal.create({
      data: {
        youtubeChannelId,

        nome: channelName,

        descricao: "",

        thumbnailUrl: playlistData.snippet.thumbnails.high?.url,
      },
    });
  }

  /*
    CRIA TRILHA
  */

  const trilha = await prisma.trilha.create({
    data: {
      titulo: playlistData.snippet.title,

      descricao: playlistData.snippet.description,

      thumbnailUrl: playlistData.snippet.thumbnails.high?.url,

      youtubePlaylistId: playlistId,

      slug: slugify(playlistData.snippet.title),

      categoriaId,

      canalId: canal.id,

      isCurated: true,
    },
  });

  /*
    PROCESSA VÍDEOS
  */

  for (let i = 0; i < videosData.length; i++) {
    const item = videosData[i];

    const videoId = item.snippet.resourceId.videoId;

    /*
      VERIFICA EXISTÊNCIA
    */

    let video = await prisma.video.findUnique({
      where: {
        youtubeVideoId: videoId,
      },
    });

    /*
      CRIA VÍDEO
    */

    if (!video) {
      video = await prisma.video.create({
        data: {
          youtubeVideoId: videoId,

          titulo: item.snippet.title,

          descricao: item.snippet.description,

          thumbnailUrl: item.snippet.thumbnails.high?.url,

          canalId: canal.id,

          tags: [],

          isCurated: true,
        },
      });
    }

    /*
      RELACIONA
    */

    const relationExists = await prisma.trilhaVideo.findFirst({
      where: {
        trilhaId: trilha.id,

        videoId: video.id,
      },
    });

    if (!relationExists) {
      await prisma.trilhaVideo.create({
        data: {
          trilhaId: trilha.id,

          videoId: video.id,

          ordem: i + 1,
        },
      });
    }
  }

  return trilha;
}

/*
  LISTAR TRILHAS
*/

export async function listarTrilhasService() {
  return prisma.trilha.findMany({
    where: {
      ativa: true,
    },

    include: {
      categoria: true,

      canal: true,

      videos: true,
    },

    orderBy: {
      criadaEm: "desc",
    },
  });
}

/*
  BUSCAR TRILHA
*/

export async function buscarTrilhaService(slug: string) {
  return prisma.trilha.findUnique({
    where: {
      slug,
    },

    include: {
      categoria: true,

      canal: true,

      videos: {
        include: {
          video: true,
        },

        orderBy: {
          ordem: "asc",
        },
      },
    },
  });
}
