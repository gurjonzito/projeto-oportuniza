import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";

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
  Brain,
  CheckCircle2,
  XCircle,
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

import { gerarQuiz } from "../services/quizService";

import type { Quiz } from "../types/quiz";

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

type AudioStatus = "parado" | "carregando" | "tocando" | "pausado";

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
  if (details.duracaoSegundos != null)
    return formatSeconds(details.duracaoSegundos);

  if (details.duracaoISO) return formatISO(details.duracaoISO);

  return "";
}

interface RespostaQuiz {
  questionId: string;
  optionId: string;
}

interface ResultadoQuestao {
  questionId: string;
  pergunta: string;

  alternativaSelecionada: {
    id: string;
    texto: string;
  };

  alternativaCorreta: {
    id: string;
    texto: string;
  };

  acertou: boolean;
  explicacao: string | null;
}

interface ResultadoQuiz {
  id: string;
  pontuacao: number;
  total: number;
  percentual: number;
  respostas: ResultadoQuestao[];
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

  // ============================================================
  // QUIZ
  // ============================================================

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [gerandoQuiz, setGerandoQuiz] = useState(false);

  const [quizError, setQuizError] = useState("");

  const [respostas, setRespostas] = useState<RespostaQuiz[]>([]);

  const [corrigindoQuiz, setCorrigindoQuiz] = useState(false);

  const [resultadoQuiz, setResultadoQuiz] = useState<ResultadoQuiz | null>(
    null,
  );

  async function gerarResumoVideo() {
    pararResumo(() => setAudioStatus("parado"));

    setResumo("");

    setGerandoResumo(true);

    try {
      const [texto] = await Promise.all([
        gerarResumo(id),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ]);

      setResumo(texto as string);
    } finally {
      setGerandoResumo(false);
    }
  }

  // ============================================================
  // GERAR QUIZ
  // ============================================================

  async function gerarQuizVideo() {
    if (!id) return;

    setQuizError("");
    setGerandoQuiz(true);

    try {
      const quizGerado = await gerarQuiz(id);

      setQuiz(quizGerado);

      setRespostas([]);

      setResultadoQuiz(null);
    } catch (error: any) {
      console.error("Erro ao gerar quiz:", error);

      setQuizError(
        error?.response?.data?.error ?? "Não foi possível gerar o quiz.",
      );
    } finally {
      setGerandoQuiz(false);
    }
  }

  // ============================================================
  // SELECIONAR ALTERNATIVA
  // ============================================================

  function selecionarResposta(questionId: string, optionId: string) {
    if (resultadoQuiz) return;

    setRespostas((respostasAtuais) => {
      const existente = respostasAtuais.find(
        (resposta) => resposta.questionId === questionId,
      );

      if (existente) {
        return respostasAtuais.map((resposta) =>
          resposta.questionId === questionId
            ? {
                ...resposta,
                optionId,
              }
            : resposta,
        );
      }

      return [
        ...respostasAtuais,
        {
          questionId,
          optionId,
        },
      ];
    });
  }

  // ============================================================
  // CORRIGIR QUIZ
  // ============================================================

  async function corrigirQuizVideo() {
    if (!quiz) return;

    if (respostas.length !== quiz.questoes.length) {
      setQuizError("Responda todas as questões antes de finalizar.");
      return;
    }

    setQuizError("");
    setCorrigindoQuiz(true);

    try {
      const { data } = await api.post(`/api/quiz/${quiz.id}/corrigir`, {
        respostas,
      });

      setResultadoQuiz(data);
    } catch (error: any) {
      console.error("Erro ao corrigir quiz:", error);

      setQuizError(
        error?.response?.data?.error ?? "Não foi possível corrigir o quiz.",
      );
    } finally {
      setCorrigindoQuiz(false);
    }
  }

  // ============================================================
  // ÁUDIO
  // ============================================================

  function controlarAudio() {
    if (audioStatus === "carregando") {
      return;
    }

    if (audioStatus === "tocando") {
      pausarResumo();

      setAudioStatus("pausado");

      return;
    }

    if (audioStatus === "pausado") {
      setAudioStatus("carregando");

      continuarResumo();

      return;
    }

    setAudioStatus("carregando");

    ouvirResumo(
      resumo,
      () => setAudioStatus("tocando"),
      () => setAudioStatus("parado"),
    );
  }

  // ============================================================
  // DETALHES DO VÍDEO
  // ============================================================

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    setDetails(null);

    api
      .get(`/youtube/detalhes/${id}`)
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

  // ============================================================
  // TROCA DE VÍDEO
  // ============================================================

  useEffect(() => {
    pararResumo(() => setAudioStatus("parado"));

    setResumo("");

    setGerandoResumo(false);

    // Limpa quiz anterior
    setQuiz(null);

    setGerandoQuiz(false);

    setQuizError("");

    setRespostas([]);

    setResultadoQuiz(null);
  }, [id]);

  // ============================================================
  // MENSAGENS DO RESUMO
  // ============================================================

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

  // ============================================================
  // NAVEGAÇÃO ENTRE VÍDEOS
  // ============================================================

  function goTo(index: number) {
    const video = trilhaVideos[index];

    navigate(`/player/${video.youtubeVideoId}`, {
      state: {
        trilhaTitulo,
        trilhaVideos,
        currentIndex: index,
      },
    });
  }

  if (!id) {
    return (
      <p className="p-10 text-white">Vídeo não encontrado (ID inválido)</p>
    );
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
            <p className="text-sm opacity-60 animate-pulse">
              Carregando detalhes...
            </p>
          ) : details ? (
            <>
              <p className="text-lg font-semibold">{details.titulo}</p>

              <p className="text-sm opacity-80">{details.canal}</p>

              {duracao && <p className="text-sm opacity-60">⏱ {duracao}</p>}
            </>
          ) : (
            <p className="text-sm opacity-60">Detalhes não disponíveis</p>
          )}
        </div>

        {/* =====================================================
            RESUMO
        ====================================================== */}

        <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-5">
          {!resumo && !gerandoResumo && (
            <button
              onClick={gerarResumoVideo}
              className="flex items-center gap-2 rounded-full bg-white text-[#1E40AF] font-semibold px-5 py-2.5 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles size={18} />
              Gerar Resumo por IA
            </button>
          )}

          {gerandoResumo && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin" />

              <p className="text-sm opacity-80 animate-pulse transition-opacity duration-300">
                {MENSAGENS_LOADING[loadingMsgIndex]}
              </p>
            </div>
          )}

          {resumo && !gerandoResumo && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles size={18} />
                Resumo por IA
              </h2>

              <div
                className="
                    text-sm
                    leading-relaxed
                    text-justify
                    prose
                    prose-invert
                    prose-sm
                    max-w-none
                    prose-p:mb-3
                    prose-strong:text-white
                    prose-strong:font-semibold
                    prose-ul:mt-2
                    prose-ul:space-y-1
                    prose-li:marker:text-blue-300
                  "
              >
                <ReactMarkdown>{resumo}</ReactMarkdown>
              </div>

              <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={controlarAudio}
                  disabled={audioStatus === "carregando"}
                  className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white/10
                      hover:bg-white/20
                      px-5
                      py-2.5
                      transition-all
                      duration-200
                      hover:scale-105
                      active:scale-95
                      disabled:opacity-60
                      disabled:cursor-wait
                    "
                >
                  {audioStatus === "carregando" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Carregando áudio...
                    </>
                  ) : audioStatus === "tocando" ? (
                    <>
                      <Pause size={18} />
                      Pausar
                    </>
                  ) : audioStatus === "pausado" ? (
                    <>
                      <Volume2 size={18} />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} />
                      Ouvir Resumo
                    </>
                  )}
                </button>

                <button
                  onClick={() => baixarPDF(details?.titulo ?? "Resumo", resumo)}
                  className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white/10
                      hover:bg-white/20
                      px-5
                      py-2.5
                      transition-all
                      duration-200
                      hover:scale-105
                      active:scale-95
                      cursor-pointer
                    "
                >
                  <Download size={18} />
                  Baixar PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            QUIZ
        ====================================================== */}

        <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-5">
          {/* Estado inicial */}
          {!quiz && !gerandoQuiz && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Brain size={20} />
                  Teste seus conhecimentos
                </h2>

                <p className="text-sm opacity-70 mt-1">
                  Responda a um quiz gerado por IA com base no conteúdo desta
                  aula.
                </p>
              </div>

              <button
                onClick={gerarQuizVideo}
                className="
                    flex
                    items-center
                    gap-2
                    self-start
                    rounded-full
                    bg-white
                    text-[#1E40AF]
                    font-semibold
                    px-5
                    py-2.5
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
              >
                <Sparkles size={18} />
                Gerar Quiz por IA
              </button>

              {quizError && <p className="text-sm text-red-200">{quizError}</p>}
            </div>
          )}

          {/* Carregando quiz */}
          {gerandoQuiz && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 size={30} className="animate-spin" />

              <p className="text-sm opacity-80 animate-pulse">
                Criando seu quiz...
              </p>

              <p className="text-xs opacity-60">
                A IA está preparando as questões com base no conteúdo da aula.
              </p>
            </div>
          )}

          {/* Quiz */}
          {quiz && !gerandoQuiz && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Brain size={22} />

                  {quiz.titulo}
                </h2>

                <p className="text-sm opacity-70 mt-1">
                  {quiz.questoes.length} questões para verificar seu
                  aprendizado.
                </p>
              </div>

              {/* Questões */}
              <div className="space-y-6">
                {quiz.questoes.map((questao, index) => {
                  const respostaSelecionada = respostas.find(
                    (resposta) => resposta.questionId === questao.id,
                  );

                  const resultado = resultadoQuiz?.respostas.find(
                    (item) => item.questionId === questao.id,
                  );

                  return (
                    <div
                      key={questao.id}
                      className="
                          rounded-2xl
                          bg-black/10
                          border
                          border-white/10
                          p-5
                        "
                    >
                      <p className="font-semibold mb-4">
                        {index + 1}. {questao.pergunta}
                      </p>

                      <div className="space-y-2">
                        {questao.alternativas.map(
                          (alternativa, alternativaIndex) => {
                            const selecionada =
                              respostaSelecionada?.optionId === alternativa.id;

                            const acertou =
                              resultado &&
                              resultado.alternativaSelecionada.id ===
                                alternativa.id &&
                              resultado.acertou;

                            const eraCorreta =
                              resultado &&
                              resultado.alternativaCorreta.id ===
                                alternativa.id;

                            return (
                              <button
                                key={alternativa.id}
                                type="button"
                                disabled={!!resultado}
                                onClick={() =>
                                  selecionarResposta(questao.id, alternativa.id)
                                }
                                className={`
                                    w-full
                                    text-left
                                    p-4
                                    rounded-xl
                                    border
                                    transition-all
                                    duration-200
                                    ${
                                      acertou
                                        ? "bg-green-500/30 border-green-300"
                                        : eraCorreta
                                          ? "bg-green-500/30 border-green-300"
                                          : selecionada
                                            ? "bg-white/20 border-white"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }
                                    ${
                                      resultado
                                        ? "cursor-default"
                                        : "cursor-pointer"
                                    }
                                  `}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className="
                                        w-8
                                        h-8
                                        shrink-0
                                        rounded-full
                                        bg-white/10
                                        flex
                                        items-center
                                        justify-center
                                        text-sm
                                        font-semibold
                                      "
                                  >
                                    {String.fromCharCode(65 + alternativaIndex)}
                                  </span>

                                  <span className="flex-1">
                                    {alternativa.texto}
                                  </span>

                                  {resultado && acertou && (
                                    <CheckCircle2
                                      size={20}
                                      className="shrink-0"
                                    />
                                  )}

                                  {resultado &&
                                    selecionada &&
                                    !resultado.acertou && (
                                      <XCircle size={20} className="shrink-0" />
                                    )}
                                </div>
                              </button>
                            );
                          },
                        )}
                      </div>

                      {/* Explicação após correção */}
                      {resultado && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="font-semibold text-sm mb-1">
                            {resultado.acertou
                              ? "Resposta correta!"
                              : "Resposta incorreta"}
                          </p>

                          {!resultado.acertou && (
                            <p className="text-sm opacity-80 mb-2">
                              <strong>Resposta correta:</strong>{" "}
                              {resultado.alternativaCorreta.texto}
                            </p>
                          )}

                          {resultado.explicacao && (
                            <p className="text-sm opacity-80 leading-relaxed">
                              {resultado.explicacao}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Erro */}
              {quizError && <p className="text-sm text-red-200">{quizError}</p>}

              {/* Resultado */}
              {resultadoQuiz && (
                <div
                  className="
                    rounded-2xl
                    bg-white/10
                    border
                    border-white/10
                    p-6
                    text-center
                  "
                >
                  <p className="text-sm opacity-70">Resultado</p>

                  <p className="text-4xl font-bold mt-1">
                    {resultadoQuiz.pontuacao}/{resultadoQuiz.total}
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {resultadoQuiz.percentual.toFixed(0)}%
                  </p>

                  <p className="text-sm opacity-70 mt-2">
                    {resultadoQuiz.percentual >= 70
                      ? "Muito bem! Você demonstrou que compreendeu o conteúdo."
                      : "Revise o conteúdo da aula e tente novamente."}
                  </p>
                </div>
              )}

              {/* Botão corrigir */}
              {!resultadoQuiz && (
                <button
                  onClick={corrigirQuizVideo}
                  disabled={
                    corrigindoQuiz || respostas.length !== quiz.questoes.length
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    rounded-full
                    bg-white
                    text-[#1E40AF]
                    font-semibold
                    px-5
                    py-3
                    transition-all
                    duration-200
                    hover:scale-[1.02]
                    hover:shadow-lg
                    active:scale-[0.98]
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  {corrigindoQuiz ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Corrigindo...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Finalizar Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
