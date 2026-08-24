import { useNavigate, useParams } from "react-router-dom";
import { Play, ArrowLeft, User, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

import type { Trilha } from "../types/trilha";

import { getTrilhaBySlug } from "../services/trilhaService";
import {
  getTrilhaProgress,
  marcarVideoConcluido,
} from "../services/trilhaProgress";

export default function TrailVideos() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [trail, setTrail] = useState<Trilha | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState<Set<string>>(
    new Set()
  );
  const [marcandoVideo, setMarcandoVideo] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!slug) return;

    const slugAtual = slug;

    async function carregarTrilha() {
      try {
        setLoading(true);

        const data = await getTrilhaBySlug(slugAtual);

        setTrail(data);

        const progresso = await getTrilhaProgress(
          slugAtual
        );

        if (progresso?.videosConcluidosIds) {
          setWatched(
            new Set(progresso.videosConcluidosIds)
          );
        } else {
          setWatched(new Set());
        }
      } catch (err) {
        console.error(
          "ERRO AO BUSCAR TRILHA:",
          err
        );

        setTrail(null);
        setWatched(new Set());
      } finally {
        setLoading(false);
      }
    }

    carregarTrilha();
  }, [slug]);

  const videos = trail?.videos || [];

  const progress =
    videos.length > 0
      ? Math.round(
          (watched.size / videos.length) * 100
        )
      : 0;

  const trilhaConcluida =
    videos.length > 0 &&
    watched.size === videos.length;

  const trilhaIniciada = watched.size === 0;

  const statusTrilha = trilhaConcluida
    ? "Trilha concluída"
    : trilhaIniciada
      ? "Trilha iniciada"
      : "Trilha em andamento";

  async function toggleWatched(videoId: string) {
    if (!slug || !trail || marcandoVideo) return;

    const slugAtual = slug;

    const estavaConcluido = watched.has(videoId);

    /*
     * O backend atualmente possui apenas a operação
     * para marcar o vídeo como concluído.
     *
     * Portanto, se já estiver concluído, não fazemos
     * nenhuma alteração.
     */
    if (estavaConcluido) {
      return;
    }

    try {
      setMarcandoVideo(videoId);

      const progresso = await marcarVideoConcluido(
        slugAtual,
        videoId
      );

      setWatched(
        new Set(progresso.videosConcluidosIds)
      );
    } catch (error) {
      console.error(
        "Erro ao marcar vídeo como concluído:",
        error
      );
    } finally {
      setMarcandoVideo(null);
    }
  }

  const trilhaVideos = videos.map((item) => ({
    youtubeVideoId: item.video.youtubeVideoId,
    titulo: item.video.titulo,
  }));

  function abrirVideo(
    youtubeVideoId: string,
    index: number
  ) {
    navigate(`/player/${youtubeVideoId}`, {
      state: {
        trilhaTitulo: trail?.titulo ?? "",
        trilhaVideos,
        currentIndex: index,
      },
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando trilha...
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Trilha não encontrada.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1a45] text-white">
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

          <span
            className={`text-[11px] rounded-full px-3 py-1 ${
              trilhaConcluida
                ? "bg-green-400/15 text-green-300"
                : "bg-cyan-400/15 text-cyan-300"
            }`}
          >
            {statusTrilha}
          </span>

          <h1 className="text-2xl font-semibold mt-3">
            {trail.titulo}
          </h1>

          <p className="text-white/50 text-sm mt-2">
            {trail.descricao}
          </p>

          {/* PROGRESSO */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  trilhaConcluida
                    ? "bg-green-400"
                    : "bg-cyan-400"
                }`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span
              className={`text-xs ${
                trilhaConcluida
                  ? "text-green-400"
                  : "text-cyan-400"
              }`}
            >
              {progress}%
            </span>
          </div>

          <p className="text-white/40 text-xs mt-2">
            {watched.size} de {videos.length} aulas concluídas
          </p>

          {trilhaConcluida && (
            <p className="text-green-400 text-sm mt-4 font-medium">
              🎉 Parabéns! Você concluiu essa trilha. Continue
              evoluindo!
            </p>
          )}
        </div>
      </div>

      {/* LISTA DE VÍDEOS */}
      <div className="max-w-3xl mx-auto px-5 pt-6 pb-10">
        <ul className="flex flex-col gap-3">
          {videos.map((item, idx) => {
            const videoId =
              item.video.youtubeVideoId;

            const isWatched =
              watched.has(videoId);

            const isSaving =
              marcandoVideo === videoId;

            return (
              <li
                key={item.video.id}
                onClick={() =>
                  abrirVideo(videoId, idx)
                }
                className="group flex items-center gap-4 rounded-2xl border px-5 py-4 cursor-pointer bg-[#182f6a]/60 border-white/10"
              >
                {/* NÚMERO */}
                <span className="text-sm text-white/30">
                  {idx + 1}
                </span>

                {/* PLAY */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirVideo(videoId, idx);
                  }}
                  className="w-10 h-10 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center cursor-pointer"
                >
                  <Play
                    size={15}
                    fill="currentColor"
                  />
                </button>

                {/* INFORMAÇÕES */}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.video.titulo}
                  </p>

                  {item.video.canal && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                      <User size={10} />
                      {item.video.canal.nome}
                    </div>
                  )}
                </div>

                {/* CHECK */}
                <button
                  type="button"
                  disabled={
                    isSaving || isWatched
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatched(videoId);
                  }}
                  className={`cursor-pointer ${
                    isSaving
                      ? "opacity-50 cursor-wait"
                      : ""
                  }`}
                  title={
                    isWatched
                      ? "Aula concluída"
                      : "Marcar como concluída"
                  }
                >
                  <CheckCircle
                    size={20}
                    className={
                      isWatched
                        ? "text-cyan-400"
                        : "text-white/20 hover:text-cyan-300"
                    }
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}