import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  Pause,
  Loader2,
  Download,
} from "lucide-react";
import api from "../services/api";

import {
  ouvirResumo,
  pausarResumo,
  continuarResumo,
  pararResumo,
} from "../services/speechService";

import { gerarResumo } from "../services/resumoService";

import { baixarPDF } from "../services/pdfService";

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

type AudioStatus = "parado" | "tocando" | "pausado";

const MENSAGENS_LOADING = [
  "Analisando o vídeo...",
  "Organizando os principais pontos...",
  "Quase lá...",
];

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

  const [resumo, setResumo] = useState("");
  const [gerandoResumo, setGerandoResumo] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const [audioStatus, setAudioStatus] = useState<AudioStatus>("parado");

  async function gerarResumoVideo() {
    pararResumo(() => setAudioStatus("parado"));

    setResumo("");
    setGerandoResumo(true);

    try {
      // Delay artificial só pra dar a sensação de que está processando de verdade.
      const [texto] = await Promise.all([
        gerarResumo(id),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ]);
      setResumo(texto as string);
    } finally {
      setGerandoResumo(false);
    }
  }

  function controlarAudio() {
    if (audioStatus === "tocando") {
      pausarResumo();
      setAudioStatus("pausado");
      return;
    }

    if (audioStatus === "pausado") {
      continuarResumo();
      setAudioStatus("tocando");
      return;
    }

    ouvirResumo(
      resumo,
      () => setAudioStatus("tocando"),
      () => setAudioStatus("parado")
    );
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setDetails(null);

    api.get(`/youtube/detalhes/${id}`)
      .then(({ data }) => {
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

  // Ao trocar de vídeo, paramos qualquer áudio em andamento e limpamos o resumo anterior
  useEffect(() => {
    pararResumo(() => setAudioStatus("parado"));
    setResumo("");
    setGerandoResumo(false);
  }, [id]);

  // Troca as mensagens de "carregando" enquanto o resumo está sendo gerado
  useEffect(() => {
    if (!gerandoResumo) {
      setLoadingMsgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % MENSAGENS_LOADING.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [gerandoResumo]);

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
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
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
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
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

        {/* Caixa do Resumo por IA */}
        <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-5">

          {/* Estado inicial: nada gerado ainda */}
          {!resumo && !gerandoResumo && (
            <button
              onClick={gerarResumoVideo}
              className="flex items-center gap-2 rounded-full bg-white text-[#1E40AF] font-semibold px-5 py-2.5
                         transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles size={18} />
              Gerar Resumo por IA
            </button>
          )}

          {/* Estado de carregamento */}
          {gerandoResumo && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm opacity-80 animate-pulse transition-opacity duration-300">
                {MENSAGENS_LOADING[loadingMsgIndex]}
              </p>
            </div>
          )}

          {/* Estado com resumo pronto */}
          {resumo && !gerandoResumo && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles size={18} />
                Resumo por IA
              </h2>

              <p className="text-sm leading-relaxed whitespace-pre-line">{resumo}</p>

              <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={controlarAudio}
                  className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5
                             transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {audioStatus === "tocando" ? (
                    <Pause size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                  {audioStatus === "tocando"
                    ? "Pausar"
                    : audioStatus === "pausado"
                    ? "Continuar"
                    : "Ouvir Resumo"}
                </button>

                <button
                  onClick={() => baixarPDF(details?.titulo ?? "Resumo", resumo)}
                  className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5
                             transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Download size={18} />
                  Baixar PDF
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}