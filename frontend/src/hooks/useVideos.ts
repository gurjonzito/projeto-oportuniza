import { useEffect, useState } from "react"
import { getVideos } from "../services/videoService"
import type { Video } from "../types/video"

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVideos().then(data => {
      setVideos(data)
      setLoading(false)
    })
  }, []);

    const getVideoById = (id: string) => {
    return videos.find((video) => video.id === id);
  };

  return { videos, loading, getVideoById }
}