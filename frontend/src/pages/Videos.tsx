import { useEffect, useState } from "react";
import Search from "../components/Search";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types/video";
import { getVideos, searchVideos } from "../services/videoService";
import { getCategorias } from "../services/categoriaService";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["todos"]);

  // Carrega vídeos e categorias juntos
  useEffect(() => {
    Promise.all([getVideos(), getCategorias()])
      .then(([videosData, categoriasData]) => {
        setVideos(videosData);
        setCategories(categoriasData);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(query: string, categories: string[]) {
    setLoading(true);

    try {
      if (!query && (categories.length === 0 || categories.includes("todos"))) {
        const data = await getVideos();
        setVideos(data);
        return;
      }

      const category = categories.find((c) => c !== "todos");
      const data = await searchVideos(query || "", category);
      setVideos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Search<Video>
      items={videos}
      loading={loading}
      onSearch={handleSearch}
      placeholder="O que você quer aprender hoje?"
      itemsPerPage={6}
      categories={categories}
      renderItem={(video) => (
        <VideoCard
          key={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          videoId={video.videoId}
          channel={video.channel}
          duration={video.duration}
        />
      )}
    />
  );
}