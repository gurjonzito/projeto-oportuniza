import axios from "axios";

import { buildSearchQuery } from "../utils/buildSearchQuery";

import { blockedTerms } from "../utils/blockedTerms";

import { detectCategory } from "../utils/categoryMapper";

import { getActiveChannels } from "./canalService";

const BASE = "https://www.googleapis.com/youtube/v3";

const KEY = process.env.YOUTUBE_API_KEY!;

/*
  BUSCA VÍDEOS
*/

export async function buscarVideos(termo: string) {
  /*
    BUSCA CANAIS ATIVOS
  */

  const channels = await getActiveChannels();
  console.log(channels);

  /*
    GERA QUERIES
  */

  const queries = buildSearchQuery(termo, channels);

  let allVideos: any[] = [];

  /*
    BUSCA POR CADA CANAL
  */

  for (const queryData of queries) {
    try {
      const { data } = await axios.get(`${BASE}/search`, {
        params: {
          part: "snippet",

          q: queryData.query,

          channelId: queryData.channelId,

          type: "video",

          videoDuration: "medium",

          maxResults: 10,

          relevanceLanguage: "pt",

          regionCode: "BR",

          safeSearch: "strict",

          key: KEY,
        },
      });

      /*
        GARANTE ARRAY
      */

      const items = data.items ?? [];

      /*
        FILTRO DE QUALIDADE
      */

      const filtered = items.filter((item: any) => {
        const title = item?.snippet?.title?.toLowerCase?.() ?? "";

        /*
              REMOVE TERMOS BLOQUEADOS
            */

        const hasBlocked = blockedTerms.some((term) => title.includes(term));

        /*
              IGNORA VÍDEOS SEM ID
            */

        const hasVideoId = !!item?.id?.videoId;

        return !hasBlocked && hasVideoId;
      });

      /*
        FORMATA
      */

      const mapped = filtered.map((item: any) => ({
        youtubeVideoId: item.id.videoId,

        channelId: item.snippet.channelId,

        titulo: item.snippet.title,

        canal: item.snippet.channelTitle,

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          "",

        descricao: item.snippet.description,

        publishedAt: item.snippet.publishedAt,

        categoria: detectCategory(item.snippet.title),
      }));

      allVideos.push(...mapped);
    } catch (error) {
      console.error("ERRO AO BUSCAR VÍDEOS:", error);
    }
  }

  /*
    REMOVE DUPLICADOS
  */

  const uniqueVideos = allVideos.filter(
    (video, index, self) =>
      index ===
      self.findIndex((v) => v.youtubeVideoId === video.youtubeVideoId),
  );

  return uniqueVideos;
}

/*
  BUSCA PLAYLIST
*/

export async function buscarPlaylist(playlistId: string) {
  const { data } = await axios.get(`${BASE}/playlists`, {
    params: {
      part: "snippet",

      id: playlistId,

      key: KEY,
    },
  });

  return data.items?.[0] ?? null;
}

/*
  BUSCA VÍDEOS DA PLAYLIST
*/

export async function buscarVideosPlaylist(playlistId: string) {
  const { data } = await axios.get(`${BASE}/playlistItems`, {
    params: {
      part: "snippet",

      playlistId,

      maxResults: 50,

      key: KEY,
    },
  });

  return data.items ?? [];
}

/*
  DETALHES DO VÍDEO
*/

export async function buscarDetalhesVideo(videoId: string) {
  const { data } = await axios.get(`${BASE}/videos`, {
    params: {
      part: "snippet,contentDetails,statistics",

      id: videoId,

      key: KEY,
    },
  });

  const v = data.items?.[0];

  if (!v) {
    return null;
  }

  return {
    youtubeVideoId: v.id,

    titulo: v.snippet.title,

    canal: v.snippet.channelTitle,

    duracaoISO: v.contentDetails.duration,

    visualizacoes: v.statistics.viewCount,

    tags: v.snippet.tags ?? [],
  };
}

/*
  VÍDEOS DO CANAL
*/

export async function buscarVideosDoCanal(channelId: string) {
  const { data } = await axios.get(`${BASE}/search`, {
    params: {
      part: "snippet",

      channelId,

      type: "video",

      order: "date",

      maxResults: 10,

      key: KEY,
    },
  });

  const items = data.items ?? [];

  return items.map((item: any) => ({
    youtubeVideoId: item.id.videoId,

    titulo: item.snippet.title,

    thumbnail:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      "",

    descricao: item.snippet.description,
  }));
}
