import { useEffect, useState } from "react";

import Search from "../components/Search";

import VideoCard from "../components/VideoCard";

import type { Video } from "../types/video";

import { getVideos, searchVideos } from "../services/videoService";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(true);

  /*
    CARREGA VÍDEOS
  */

  useEffect(() => {
    getVideos()
      .then((data) => {
        setVideos(data);
      })

      .catch((error) => {
        console.error(error);
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
    PESQUISA BACKEND
  */

  async function handleSearch(query: string, categories: string[]) {
    setLoading(true);

    try {
      /*
        SEM PESQUISA
      */

      if (!query && (categories.length === 0 || categories.includes("todos"))) {
        const data = await getVideos();

        setVideos(data);

        return;
      }

      /*
        PEGA CATEGORIA
      */

      const category = categories.find((c) => c !== "todos");

      /*
        BUSCA API
      */

      const data = await searchVideos(query || "", category);

      setVideos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  console.log(videos);
  console.log(loading);

  return (
    <Search<Video>
      items={videos}
      loading={loading}
      onSearch={handleSearch}
      placeholder="O que você quer aprender hoje?"
      itemsPerPage={6}
      categories={["todos", "emprego", "tecnologia", "educação", "finanças"]}
      renderItem={(video) => (
        <VideoCard
          key={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channel={video.channel}
          duration={video.duration}
        />
      )}
    />
  );
}
