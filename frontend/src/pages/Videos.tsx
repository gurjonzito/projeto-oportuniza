import { useEffect, useState } from "react";
import Search from "../components/Search";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types/video";
import { getVideos, searchVideos } from "../services/videoService";
import Loading from "../components/Loading";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos()
      .then((data) => {
        setVideos(data);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(query: string) {
    setLoading(true);

    try {
      if (!query) {
        const data = await getVideos();
        setVideos(data);
        return;
      }

      const data = await searchVideos(query);
      setVideos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && videos.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--bg-color)" }}
      >
        <Loading
          texto="Carregando vídeos..."
          subtexto="Preparando sua biblioteca"
          altura="100vh"
        />
      </div>
    );
  }

  return (
    <Search<Video>
      items={videos}
      loading={loading}
      onSearch={handleSearch}
      placeholder="O que você quer aprender hoje?"
      itemsPerPage={6}
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
