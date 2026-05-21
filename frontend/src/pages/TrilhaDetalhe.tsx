import { useNavigate, useParams } from "react-router-dom";
import { Play, ArrowLeft, User, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

import type { Trilha } from "../types/trilha";
import { getTrilhaBySlug } from "../services/trilhaService";

export default function TrailVideos() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [trail, setTrail] = useState<Trilha | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;

    console.log("SLUG RECEBIDO:", slug);

    getTrilhaBySlug(slug)
      .then((data) => {
        console.log("TRILHA RECEBIDA:", data);
        setTrail(data);
      })
      .catch((err) => {
        console.error("ERRO AO BUSCAR TRILHA:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleWatched = (id: string) => {
    setWatched((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const videos = trail?.videos || [];

  const progress =
    videos.length > 0
      ? Math.round((watched.size / videos.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2259] flex items-center justify-center">
        <p className="text-white/60 text-sm">Carregando trilha...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f2259] text-white pb-20">

      {/* HEADER */}
      <div className="bg-[#0a1a45] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 py-6">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-5 cursor-pointer"
          >
            <ArrowLeft size={15} />
            Voltar às trilhas
          </button>

          <span className="text-[11px] bg-cyan-400/15 text-cyan-300 rounded-full px-3 py-1">
            {trail?.categoria?.nome}
          </span>

          <h1 className="text-2xl font-semibold mt-3">
            {trail?.titulo}
          </h1>

          <p className="text-white/50 text-sm mt-2">
            {trail?.descricao}
          </p>

          {/* PROGRESSO */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-cyan-400 text-xs">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="max-w-3xl mx-auto px-5 pt-6">
        <ul className="flex flex-col gap-3">

          {videos.map((item, idx) => {

  const videoId = item.video.youtubeVideoId;

  return (
    <li
      key={item.video.id}
      onClick={() => navigate(`/player/${videoId}`)}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        px-5
        py-4
        cursor-pointer
        bg-[#182f6a]/60
        border-white/9
      "
    >

      <span className="text-sm text-white/30">
        {idx + 1}
      </span>

      <button className="w-10 h-10 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center cursor-pointer">
        <Play size={15} fill="currentColor" />
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium">
          {item.video.titulo}
        </p>

        <div className="flex items-center gap-3 mt-1">

          {item.video.canal && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <User size={10} />
              {item.video.canal.nome}
            </span>
          )}

        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWatched(videoId); // 🔥 CORRETO
        }}
        className="text-white/20 cursor-pointer"
      >
        <CheckCircle size={18} />
      </button>

    </li>
  );
})}

        </ul>
      </div>
    </div>
  );
}