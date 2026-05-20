import axios from "axios";

import { buildSearchQuery } from "../utils/buildSearchQuery";

import { isApprovedChannel } from "../utils/isApprovedChannel";

import { blockedTerms } from "../utils/blockedTerms";

import { detectCategory } from "../utils/categoryMapper";

const BASE = "https://www.googleapis.com/youtube/v3";

const KEY = process.env.YOUTUBE_API_KEY!;

export async function buscarVideos(termo: string) {
  const termoEducacional = buildSearchQuery(termo);

  const { data } = await axios.get(`${BASE}/search`, {
    params: {
      part: "snippet",

      q: termoEducacional,

      videoDuration: "medium",

      type: "video",

      maxResults: 40,

      relevanceLanguage: "pt",

      regionCode: "BR",

      safeSearch: "strict",

      key: KEY,
    },
  });

  /*
    FILTRO DE QUALIDADE
  */

  const filtered = data.items.filter((item: any) => {
    const title = item.snippet.title.toLowerCase();

    const channel = item.snippet.channelTitle;

    /*
          REMOVE TERMOS RUINS
        */

    const hasBlocked = blockedTerms.some((term) => title.includes(term));

    if (hasBlocked) {
      return false;
    }

    /*
          CANAIS APROVADOS
        */

    return isApprovedChannel(channel);
  });

  /*
    FORMATA RETORNO
  */

  return filtered.map((item: any) => ({
    youtubeVideoId: item.id.videoId,

    titulo: item.snippet.title,

    canal: item.snippet.channelTitle,

    thumbnail: item.snippet.thumbnails.high.url,

    descricao: item.snippet.description,

    categoria: detectCategory(item.snippet.title),
  }));
}

export async function buscarPlaylist(
  playlistId: string
) {

  const { data } =
    await axios.get(
      `${BASE}/playlists`,
      {
        params: {

          part: "snippet",

          id: playlistId,

          key: KEY,
        },
      }
    )

  return data.items[0]
}

export async function buscarVideosPlaylist(
  playlistId: string
) {

  const { data } =
    await axios.get(
      `${BASE}/playlistItems`,
      {
        params: {

          part: "snippet",

          playlistId,

          maxResults: 50,

          key: KEY,
        },
      }
    )

  return data.items
}

export async function buscarDetalhesVideo(videoId: string) {
  const { data } = await axios.get(`${BASE}/videos`, {
    params: {
      part: "snippet,contentDetails,statistics",
      id: videoId,
      key: KEY,
    },
  });
  const v = data.items[0];
  return {
    youtubeVideoId: v.id,
    titulo: v.snippet.title,
    canal: v.snippet.channelTitle,
    duracaoISO: v.contentDetails.duration, // ex: "PT12M34S"
    visualizacoes: v.statistics.viewCount,
    tags: v.snippet.tags ?? [],
  };
}

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
  return data.items.map((item: any) => ({
    youtubeVideoId: item.id.videoId,
    titulo: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
  }));
}
