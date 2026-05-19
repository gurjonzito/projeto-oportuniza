import api from "./api";

import type { Video } from "../types/video";

import { videosMock } from "../mocks/videosMock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const getVideos = async (query?: string): Promise<Video[]> => {
  /*
      MOCK
    */

  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(videosMock), 300));
  }

  /*
      API
    */

  const { data } = await api.get<{
    videos: Video[];
  }>("/videos", {
    params: query ? { q: query } : {},
  });

  return data.videos;
};

export const searchVideos = async (
  query: string,
  category?: string,
): Promise<Video[]> => {
  /*
      MOCK
    */

  if (USE_MOCK) {
    return videosMock.filter((v) =>
      v.title.toLowerCase().includes(query.toLowerCase()),
    );
  }

  /*
      API
    */

  const { data } = await api.get<{
    videos: Video[];
  }>("/videos/search", {
    params: {
      q: query,

      ...(category && category !== "todos" ? { category } : {}),
    },
  });

  return data.videos;
};
