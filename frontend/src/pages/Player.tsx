import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VideoDetails {
  titulo: string;
  canal: string;
  duracaoSegundos: number | null;
  duracaoISO: string | null;
}

interface TrilhaVideo {
  youtubeVideoId: string;
  titulo: string;
}

interface LocationState {
  trilhaTitulo?: string;
  trilhaVideos?: TrilhaVideo[];
  currentIndex?: number;
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatISO(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatDuration(details: VideoDetails): string {
  if (details.duracaoSegundos != null) return formatSeconds(details.duracaoSegundos);
  if (details.duracaoISO) return formatISO(details.duracaoISO);
  return "";
}

export default function Player() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as LocationState;

  const trilhaTitulo = state.trilhaTitulo ?? "Reproduzindo vídeo";
  const trilhaVideos = state.trilhaVideos ?? [];
  const currentIndex = state.currentIndex ?? -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < trilhaVideos.length - 1;

  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setDetails(null);

    fetch(`/api/youtube/detalhes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDetails({
          titulo: data.titulo ?? "",
          canal: data.canal ?? "",
          duracaoSegundos: data.duracaoSegundos ?? null,
          duracaoISO: data.duracaoISO ?? null,
        });
      })
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [id]);

  function goTo(index: number) {
    const video = trilhaVideos[index];
    navigate(`/player/${video.youtubeVideoId}`, {
      state: { trilhaTitulo, trilhaVideos, currentIndex: index },
    });
  }

  if (!id) {
    return <p className="p-10 text-white">Vídeo não encontrado (ID inválido)</p>;
  }

  const duracao = details ? formatDuration(details) : "";

  return (
    <div className="bg-[#1E40AF] min-h-screen text-white pb-16">
      <div className="max-w-5xl mx-auto pt-10 px-6">

        {/* Título da trilha */}
        <h1 className="text-3xl font-bold mb-6">{trilhaTitulo}</h1>

        {/* Botões + Player */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={!hasPrev}
            className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Vídeo anterior"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="flex-1">
            <VideoPlayer videoId={id} title={details?.titulo ?? "Vídeo"} />
          </div>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={!hasNext}
            className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Próximo vídeo"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Detalhes do vídeo */}
        <div className="mt-6 space-y-1">
          {loading ? (
            <p className="text-sm opacity-60 animate-pulse">Carregando detalhes...</p>
          ) : details ? (
            <>
              <p className="text-lg font-semibold">{details.titulo}</p>
              <p className="text-sm opacity-80">{details.canal}</p>
              {duracao && (
                <p className="text-sm opacity-60">⏱ {duracao}</p>
              )}
            </>
          ) : (
            <p className="text-sm opacity-60">Detalhes não disponíveis</p>
          )}
        </div>

      </div>
    </div>
  );
}