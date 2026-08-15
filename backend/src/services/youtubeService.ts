import axios from "axios";

import { buildSearchQuery } from "../utils/buildSearchQuery";
import { shouldBlock } from "../utils/slugify";
import { parseDurationToSeconds } from "../utils/durationParser";
import { detectCategory } from "../utils/categoryMapper";
import { getActiveChannels } from "./canalService";

const BASE = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY!;

const MIN_DURATION_SECONDS = 120;

/*
  BUSCA VÍDEOS
*/

export async function buscarVideos(termo: string) {
  const channels = await getActiveChannels();
  const queries = buildSearchQuery(termo, channels);

  // Busca todos os canais em paralelo
  const results = await Promise.allSettled(
    queries.map(async (queryData) => {
      const { data } = await axios.get(`${BASE}/search`, {
        params: {
          part: "snippet",
          q: queryData.query,
          channelId: queryData.channelId,
          type: "video",
          videoDuration: "medium",
          maxResults: 25, // era 10
          relevanceLanguage: "pt",
          regionCode: "BR",
          safeSearch: "strict",
          key: KEY,
        },
      });

      const items: any[] = data.items ?? [];

      const preFiltered = items.filter((item: any) => {
        const hasVideoId = !!item?.id?.videoId;
        const title = item?.snippet?.title ?? "";
        const description = item?.snippet?.description ?? "";
        return hasVideoId && !shouldBlock({ title, description });
      });

      if (preFiltered.length === 0) return [];

      const videoIds = preFiltered.map((item: any) => item.id.videoId).join(",");

      const { data: detailsData } = await axios.get(`${BASE}/videos`, {
        params: {
          part: "contentDetails",
          id: videoIds,
          key: KEY,
        },
      });

      const durationsMap: Record<string, number> = {};
      for (const detail of detailsData.items ?? []) {
        durationsMap[detail.id] = parseDurationToSeconds(
          detail.contentDetails.duration
        );
      }

      const filtered = preFiltered.filter((item: any) => {
        const duration = durationsMap[item.id.videoId] ?? 0;
        return duration >= MIN_DURATION_SECONDS;
      });

      return filtered.map((item: any) => ({
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
        duracaoSegundos: durationsMap[item.id.videoId] ?? 0,
      }));
    })
  );

  const allVideos = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  // Remove duplicados
  const uniqueVideos = allVideos.filter(
    (video, index, self) =>
      index === self.findIndex((v) => v.youtubeVideoId === video.youtubeVideoId)
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