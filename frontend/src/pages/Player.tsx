import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import VideoPlayer from "../components/VideoPlayer";

import api from "../services/api";

export default function Player() {
  const { id } = useParams();

  const [video, setVideo] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    api
      .get(`/videos/${id}`)

      .then((res) => {
        setVideo(res.data);
      })

      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="p-10">Carregando...</p>;
  }

  if (!video) {
    return <p className="p-10">Vídeo não encontrado</p>;
  }

  return (
    <div
      className="
        bg-[#1E40AF]
        min-h-screen
        text-white
        pb-16
      "
    >
      <div
        className="
          max-w-5xl
          mx-auto
          pt-10
          px-6
        "
      >
        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >
          {video.titulo}
        </h1>

        <VideoPlayer videoId={video.youtubeVideoId} title={video.titulo} />

        <div
          className="
            mt-6
            space-y-1
          "
        >
          <p
            className="
              text-sm
              opacity-90
            "
          >
            Canal: {video.canal?.nome}
          </p>
        </div>
      </div>
    </div>
  );
}
