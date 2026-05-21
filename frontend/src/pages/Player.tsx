import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

export default function Player() {
  const { id } = useParams();

  console.log("PARAM ID:", id);

  if (!id) {
    return (
      <p className="p-10 text-white">
        Vídeo não encontrado (ID inválido)
      </p>
    );
  }

  return (
    <div className="bg-[#1E40AF] min-h-screen text-white pb-16">
      <div className="max-w-5xl mx-auto pt-10 px-6">

        <h1 className="text-3xl font-bold mb-6">
          Reproduzindo vídeo
        </h1>

        {/* 🎬 PLAYER (YouTube direto) */}
        <VideoPlayer videoId={id} title="Vídeo" />

        <div className="mt-6 space-y-1">
          <p className="text-sm opacity-90">
            ID do vídeo: {id}
          </p>
        </div>

      </div>
    </div>
  );
}