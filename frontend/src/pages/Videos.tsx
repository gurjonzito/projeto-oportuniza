import { useEffect, useState } from "react";
import Search from "../components/Search";
import VideoCard from "../components/VideoCard";
import type { Video } from "../types/video";
import { getVideos } from "../services/videoService";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  return (
    <Search<Video>
      items={videos}
      placeholder="O que você quer aprender hoje?"
      itemsPerPage={6}
      categories={["todos", "emprego", "tecnologia", "educação", "finanças"]}
      filterFn={(video, search, selectedCategories) => {
        const matchSearch = video.title.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
          selectedCategories.length === 0 ||
          selectedCategories.includes("todos") ||
          selectedCategories.includes(video.category);
        return matchSearch && matchFilter;
      }}
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