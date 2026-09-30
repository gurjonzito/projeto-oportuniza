import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Sparkles,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { Trilha } from "../types/trilha";

import { getTrilhas } from "../services/trilhaService";

import {
  recomendarTrilhas,
  type RespostasQuestionario,
  type TrilhaRecomendada,
} from "../services/recomendacaoService";

import RecomendacoesIA from "../components/RecomendacoesIA";

import Loading from "../components/Loading";

/* ────────────────────────────── TIPOS ────────────────────────────── */

type GrupoCategoria = {
  numero: number;
  nome: string;
  trilhas: Trilha[];
};

/* ──────────────────────────── CONFIG ─────────────────────────────── */

const CATEGORIA_CONFIG: Record<string, { emoji: string; color: string }> = {
  Emprego: { emoji: "💼", color: "#3b82f6" },
  Tecnologia: { emoji: "💻", color: "#8b5cf6" },
  Finanças: { emoji: "🪙", color: "#10b981" },
  Idiomas: { emoji: "🌐", color: "#f59e0b" },
  Negócios: { emoji: "📊", color: "#ef4444" },
  Desenvolvimento: { emoji: "🧠", color: "#06b6d4" },
};

const NIVEL_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  "Iniciante": {
    bg: "rgba(16,185,129,0.15)",
    color: "#10b981",
    label: "Iniciante",
  },
  "Básico": {
    bg: "rgba(16,185,129,0.15)",
    color: "#10b981",
    label: "Iniciante",
  },
  "Intermediário": {
    bg: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
    label: "Intermediário",
  },
  "Avançado": {
    bg: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    label: "Avançado",
  },
  "Todos os níveis": {
    bg: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    label: "Todos os níveis",
  },
};

function getCfg(nome: string) {
  return CATEGORIA_CONFIG[nome] ?? { emoji: "📚", color: "#6366f1" };
}

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ───────────────────── HOOK: detecta breakpoint ──────────────────── */

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

/* ──────────────────────────── OPÇÕES ─────────────────────────────── */

const OBJETIVOS = [
  "Conseguir meu primeiro emprego",
  "Melhorar minhas chances de conseguir um emprego",
  "Desenvolver habilidades profissionais",
  "Aprender tecnologia",
  "Aprender a cuidar melhor do meu dinheiro",
  "Aprender idiomas",
  "Começar um negócio",
  "Desenvolver habilidades pessoais",
];

const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

const AREAS = [
  "Emprego e carreira",
  "Tecnologia",
  "Finanças",
  "Idiomas",
  "Negócios",
  "Desenvolvimento pessoal",
];

const TEMPOS = [
  "Até 1 hora por semana",
  "1 a 3 horas por semana",
  "3 a 5 horas por semana",
  "Mais de 5 horas por semana",
];

/* ─────────────────────────── COMPONENTE ──────────────────────────── */

export default function Trilhas() {
  const [grupos, setGrupos] = useState<GrupoCategoria[]>([]);
  const [todasTrilhas, setTodasTrilhas] = useState<Trilha[]>([]);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [mostrarQuestionario, setMostrarQuestionario] = useState(false);
  const [etapa, setEtapa] = useState(1);

  const [respostas, setRespostas] = useState<RespostasQuestionario>({
    objetivo: "",
    nivel: "",
    areas: [],
    tempoSemanal: "",
  });

  const [recomendacoes, setRecomendacoes] = useState<TrilhaRecomendada[]>([]);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");

  const navigate = useNavigate();
  const isMobile = useIsMobile(640);

  useEffect(() => {
    getTrilhas()
      .then((trilhas) => {
        setTodasTrilhas(trilhas);

        const mapa = new Map<string, Trilha[]>();

        for (const trilha of trilhas) {
          const cat = trilha.categoria?.nome ?? "Sem categoria";

          if (!mapa.has(cat)) {
            mapa.set(cat, []);
          }

          mapa.get(cat)!.push(trilha);
        }

        setGrupos(
          Array.from(mapa.entries()).map(([nome, trilhas], idx) => ({
            numero: idx + 1,
            nome,
            trilhas,
          })),
        );
      })
      .catch((err) => console.error("Erro ao carregar trilhas:", err))
      .finally(() => setLoading(false));
  }, []);

  function toggleGrupo(nome: string) {
    setAbertos((prev) => {
      const next = new Set(prev);
      next.has(nome) ? next.delete(nome) : next.add(nome);
      return next;
    });
  }

  function abrirQuestionario() {
    setEtapa(1);
    setErroIA("");
    setMostrarQuestionario(true);
  }

  function fecharQuestionario() {
    if (!carregandoIA) {
      setMostrarQuestionario(false);
    }
  }

  function selecionarObjetivo(valor: string) {
    setRespostas((prev) => ({ ...prev, objetivo: valor }));
  }

  function selecionarNivel(valor: string) {
    setRespostas((prev) => ({ ...prev, nivel: valor }));
  }

  function alternarArea(valor: string) {
    setRespostas((prev) => {
      const existe = prev.areas.includes(valor);

      if (existe) {
        return { ...prev, areas: prev.areas.filter((a) => a !== valor) };
      }

      return { ...prev, areas: [...prev.areas, valor] };
    });
  }

  function selecionarTempo(valor: string) {
    setRespostas((prev) => ({ ...prev, tempoSemanal: valor }));
  }

  function podeAvancar() {
    if (etapa === 1) return respostas.objetivo !== "";
    if (etapa === 2) return respostas.nivel !== "";
    if (etapa === 3) return respostas.areas.length > 0;
    if (etapa === 4) return respostas.tempoSemanal !== "";
    return false;
  }

  function avancar() {
    if (!podeAvancar()) return;
    if (etapa < 4) setEtapa((prev) => prev + 1);
  }

  function voltar() {
    if (etapa > 1) setEtapa((prev) => prev - 1);
  }

  async function finalizarQuestionario() {
    if (!podeAvancar()) return;

    setCarregandoIA(true);
    setErroIA("");

    try {
      const resultado = await recomendarTrilhas(respostas, todasTrilhas);
      setRecomendacoes(resultado);
      setMostrarQuestionario(false);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error);
      setErroIA(
        "Não foi possível gerar suas recomendações agora. Tente novamente.",
      );
    } finally {
      setCarregandoIA(false);
    }
  }

  function refazerQuestionario() {
    setRespostas({ objetivo: "", nivel: "", areas: [], tempoSemanal: "" });
    setRecomendacoes([]);
    setEtapa(1);
    setErroIA("");
    setMostrarQuestionario(true);
  }

  if (loading) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "100vh",
      }}
    >
      <Loading
        texto="Carregando trilhas..."
        subtexto="Buscando categorias e curadorias"
        altura="100vh"
      />
    </div>
  );
}

  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "100vh",
      }}
    >
      {/* ───────── HEADER ───────── */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          padding: isMobile ? "36px 16px 32px" : "48px 20px 40px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: "#818cf8",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 999,
            padding: "4px 14px",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Plataforma gratuita
        </span>

        <h1
          style={{
            fontSize: "clamp(22px, 5vw, 38px)",
            fontWeight: 700,
            color: "var(--text-color)",
            margin: "0 0 12px",
            lineHeight: 1.25,
          }}
        >
          Aprenda no seu <span style={{ color: "#818cf8" }}>próprio ritmo</span>
        </h1>

        <p
          style={{
            fontSize: isMobile ? 14 : 15,
            color: "var(--text-muted)",
            maxWidth: 460,
            margin: "0 auto 28px",
            lineHeight: 1.65,
          }}
        >
          Trilhas educacionais gratuitas com vídeos do YouTube, organizadas para
          quem quer crescer na vida pessoal e profissional.
        </p>

        <button
          onClick={abrirQuestionario}
          style={{
            maxWidth: 480,
            width: "100%",
            margin: "0 auto",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: 16,
            padding: isMobile ? "12px 14px" : "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 10 : 14,
            textAlign: "left",
            cursor: "pointer",
            color: "var(--text-color)",
          }}
        >
          <div
            style={{
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
              borderRadius: 12,
              background: "rgba(99,102,241,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#818cf8",
            }}
          >
            <Sparkles size={isMobile ? 18 : 20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#818cf8",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                margin: "0 0 2px",
              }}
            >
              Recomendação inteligente
            </p>

            <p
              style={{
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: "var(--text-color)",
                margin: "0 0 2px",
              }}
            >
              Encontre sua trilha ideal
            </p>

            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Responda algumas perguntas e receba recomendações personalizadas.
            </p>
          </div>

          <ArrowRight size={16} style={{ color: "#818cf8", flexShrink: 0 }} />
        </button>
      </div>

      {/* ───────── CONTEÚDO ───────── */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: isMobile ? "24px 14px 48px" : "36px 20px 60px",
        }}
      >
        {recomendacoes.length > 0 && (
          <RecomendacoesIA
            recomendacoes={recomendacoes}
            onRefazer={refazerQuestionario}
          />
        )}

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 14,
          }}
        >
          Categorias disponíveis
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {grupos.map((grupo) => {
            const aberto = abertos.has(grupo.nome);
            const cfg = getCfg(grupo.nome);

            return (
              <div
                key={grupo.nome}
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: aberto
                    ? `1px solid ${hexAlpha(cfg.color, 0.45)}`
                    : "1px solid var(--border-color)",
                  borderRadius: 18,
                  overflow: "hidden",
                  transition: "border-color .15s, box-shadow .15s",
                  boxShadow: aberto
                    ? `0 6px 24px ${hexAlpha(cfg.color, 0.08)}`
                    : "none",
                }}
              >
                {/* Cabeçalho da categoria */}
                <button
                  onClick={() => toggleGrupo(grupo.nome)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? 12 : 16,
                    padding: isMobile ? "16px 16px" : "20px 22px",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-color)",
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 44 : 54,
                      height: isMobile ? 44 : 54,
                      borderRadius: 14,
                      background: hexAlpha(cfg.color, 0.15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? 20 : 26,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: isMobile ? 15 : 17,
                        fontWeight: 700,
                        color: "var(--text-color)",
                        margin: "0 0 4px",
                      }}
                    >
                      <span
                        style={{
                          color: cfg.color,
                          fontSize: isMobile ? 11 : 13,
                          fontWeight: 600,
                          marginRight: 8,
                        }}
                      >
                        {String(grupo.numero).padStart(2, "0")}
                      </span>
                      {grupo.nome}
                    </p>

                    <p
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: "var(--text-muted)",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: cfg.color,
                        }}
                      />
                      {grupo.trilhas.length} trilha
                      {grupo.trilhas.length !== 1 ? "s" : ""} em ordem sugerida
                    </p>
                  </div>

                  {aberto ? (
                    <ChevronUp
                      size={18}
                      style={{ color: "var(--text-muted)", flexShrink: 0 }}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      style={{ color: "var(--text-muted)", flexShrink: 0 }}
                    />
                  )}
                </button>

                {/* Trilhas em sequência */}
                {aberto && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      padding: isMobile ? "16px 14px 20px" : "22px 22px 26px",
                    }}
                  >
                    {/* Selo curadoria */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: isMobile ? 16 : 20,
                        padding: "5px 12px",
                        borderRadius: 999,
                        background: hexAlpha(cfg.color, 0.1),
                        border: `1px solid ${hexAlpha(cfg.color, 0.25)}`,
                        color: cfg.color,
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={12} />
                      Siga na sequência sugerida pela curadoria
                    </div>

                    <div style={{ position: "relative" }}>
                      {/* Linha vertical conectora */}
                      <div
                        style={{
                          position: "absolute",
                          left: isMobile ? 21 : 27,
                          top: 50,
                          bottom: 50,
                          width: 2,
                          background: `linear-gradient(to bottom, ${hexAlpha(
                            cfg.color,
                            0.4,
                          )}, ${hexAlpha(cfg.color, 0.1)})`,
                          zIndex: 0,
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: isMobile ? 10 : 14,
                        }}
                      >
                        {grupo.trilhas.map((trilha, idx) => {
                          const nivel = trilha.nivel ?? "";
                          const nivelCfg = NIVEL_CONFIG[nivel];

                          return (
                            <button
                              key={trilha.id}
                              onClick={() =>
                                navigate(`/trilhas/${trilha.slug}`)
                              }
                              style={{
                                display: "flex",
                                alignItems: "stretch",
                                gap: isMobile ? 10 : 16,
                                background: "var(--bg-subtle)",
                                border: "1px solid var(--border-color)",
                                borderRadius: 14,
                                padding: isMobile ? 10 : 14,
                                cursor: "pointer",
                                textAlign: "left",
                                color: "var(--text-color)",
                                width: "100%",
                                position: "relative",
                                zIndex: 1,
                                transition:
                                  "background .15s, border-color .15s, transform .15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--hover-bg)";
                                e.currentTarget.style.borderColor = cfg.color;
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--bg-subtle)";
                                e.currentTarget.style.borderColor =
                                  "var(--border-color)";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              {/* Coluna esquerda: número + nível */}
                              <div
                                style={{
                                  width: isMobile ? 42 : 54,
                                  flexShrink: 0,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  gap: 6,
                                }}
                              >
                                <div
                                  style={{
                                    width: isMobile ? 36 : 44,
                                    height: isMobile ? 36 : 44,
                                    borderRadius: 12,
                                    background: hexAlpha(cfg.color, 0.15),
                                    border: `1px solid ${hexAlpha(
                                      cfg.color,
                                      0.35,
                                    )}`,
                                    color: cfg.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: isMobile ? 15 : 18,
                                    lineHeight: 1,
                                  }}
                                >
                                  {idx + 1}
                                </div>

                                {nivelCfg && (
                                  <span
                                    style={{
                                      fontSize: isMobile ? 8 : 9,
                                      fontWeight: 700,
                                      color: nivelCfg.color,
                                      textTransform: "uppercase",
                                      letterSpacing: ".04em",
                                      textAlign: "center",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {nivelCfg.label}
                                  </span>
                                )}
                              </div>

                              {/* Thumbnail */}
                              {trilha.thumbnailUrl ? (
                                <img
                                  src={trilha.thumbnailUrl}
                                  alt={trilha.titulo}
                                  style={{
                                    width: isMobile ? 88 : 148,
                                    height: isMobile ? 58 : 96,
                                    borderRadius: 10,
                                    objectFit: "cover",
                                    flexShrink: 0,
                                    display: "block",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: isMobile ? 88 : 148,
                                    height: isMobile ? 58 : 96,
                                    borderRadius: 10,
                                    background: hexAlpha(cfg.color, 0.15),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: isMobile ? 22 : 34,
                                    flexShrink: 0,
                                  }}
                                >
                                  {cfg.emoji}
                                </div>
                              )}

                              {/* Conteúdo */}
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  gap: 4,
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: isMobile ? 13 : 16,
                                    fontWeight: 700,
                                    color: "var(--text-color)",
                                    margin: 0,
                                    lineHeight: 1.3,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {trilha.titulo}
                                </p>

                                {!isMobile && trilha.descricao && (
                                  <p
                                    style={{
                                      fontSize: 13,
                                      color: "var(--text-muted)",
                                      margin: 0,
                                      lineHeight: 1.5,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {trilha.descricao}
                                  </p>
                                )}

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginTop: 2,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: isMobile ? 11 : 12,
                                      color: "var(--text-muted)",
                                      fontWeight: 500,
                                    }}
                                  >
                                    <Play size={10} fill="currentColor" />
                                    {trilha.videos?.length ?? 0} vídeos
                                  </span>

                                  {trilha.isCurated && !isMobile && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "3px 9px",
                                        borderRadius: 999,
                                        background: hexAlpha(cfg.color, 0.15),
                                        color: cfg.color,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        textTransform: "uppercase",
                                        letterSpacing: ".04em",
                                      }}
                                    >
                                      <Sparkles size={9} />
                                      Curada
                                    </span>
                                  )}
                                </div>
                              </div>

                              {!isMobile && (
                                <ArrowRight
                                  size={20}
                                  style={{
                                    color: cfg.color,
                                    flexShrink: 0,
                                    alignSelf: "center",
                                    opacity: 0.7,
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────── MODAL QUESTIONÁRIO IA ───────── */}
      {mostrarQuestionario && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? 12 : 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 22,
              padding: isMobile ? 20 : 24,
              position: "relative",
            }}
          >
            {!carregandoIA && (
              <button
                onClick={fecharQuestionario}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-subtle)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            )}

            <div style={{ marginBottom: 24, paddingRight: 40 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Sparkles size={18} style={{ color: "#818cf8" }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#818cf8",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Recomendação com IA
                </span>
              </div>

              <h2
                style={{
                  fontSize: isMobile ? 20 : 22,
                  margin: "0 0 8px",
                  color: "var(--text-color)",
                }}
              >
                Encontre sua trilha ideal
              </h2>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Responda algumas perguntas para receber recomendações baseadas
                no seu perfil.
              </p>
            </div>

            <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
              {[1, 2, 3, 4].map((numero) => (
                <div
                  key={numero}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    background:
                      numero <= etapa ? "#818cf8" : "var(--border-color)",
                  }}
                />
              ))}
            </div>

            {etapa === 1 && (
              <div>
                <h3 style={tituloPergunta}>Qual é seu principal objetivo?</h3>
                <div style={listaOpcoes}>
                  {OBJETIVOS.map((objetivo) => (
                    <button
                      key={objetivo}
                      onClick={() => selecionarObjetivo(objetivo)}
                      style={opcaoStyle(respostas.objetivo === objetivo)}
                    >
                      {objetivo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div>
                <h3 style={tituloPergunta}>
                  Qual é seu nível atual de conhecimento?
                </h3>
                <p style={descricaoPergunta}>
                  Pense no seu conhecimento sobre os assuntos que deseja
                  aprender.
                </p>
                <div style={listaOpcoes}>
                  {NIVEIS.map((nivel) => (
                    <button
                      key={nivel}
                      onClick={() => selecionarNivel(nivel)}
                      style={opcaoStyle(respostas.nivel === nivel)}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etapa === 3 && (
              <div>
                <h3 style={tituloPergunta}>Quais áreas você tem interesse?</h3>
                <p style={descricaoPergunta}>Você pode escolher mais de uma.</p>
                <div style={listaOpcoes}>
                  {AREAS.map((area) => {
                    const selecionada = respostas.areas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => alternarArea(area)}
                        style={opcaoStyle(selecionada)}
                      >
                        <span>{selecionada ? "✓ " : ""}</span>
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {etapa === 4 && (
              <div>
                <h3 style={tituloPergunta}>
                  Quanto tempo você pode estudar por semana?
                </h3>
                <div style={listaOpcoes}>
                  {TEMPOS.map((tempo) => (
                    <button
                      key={tempo}
                      onClick={() => selecionarTempo(tempo)}
                      style={opcaoStyle(respostas.tempoSemanal === tempo)}
                    >
                      {tempo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {erroIA && (
              <div
                style={{
                  marginTop: 18,
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                  fontSize: 12,
                }}
              >
                {erroIA}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 28,
              }}
            >
              <button
                onClick={voltar}
                disabled={etapa === 1 || carregandoIA}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor:
                    etapa === 1 || carregandoIA ? "not-allowed" : "pointer",
                  opacity: etapa === 1 ? 0.4 : 1,
                }}
              >
                <ArrowLeft size={14} />
                Voltar
              </button>

              {etapa < 4 ? (
                <button
                  onClick={avancar}
                  disabled={!podeAvancar()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#6366f1",
                    color: "#fff",
                    cursor: podeAvancar() ? "pointer" : "not-allowed",
                    opacity: podeAvancar() ? 1 : 0.5,
                  }}
                >
                  Próximo
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={finalizarQuestionario}
                  disabled={!podeAvancar() || carregandoIA}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#6366f1",
                    color: "#fff",
                    cursor:
                      podeAvancar() && !carregandoIA
                        ? "pointer"
                        : "not-allowed",
                    opacity: podeAvancar() && !carregandoIA ? 1 : 0.5,
                  }}
                >
                  {carregandoIA ? (
                    <>
                      <Loader2
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Encontrar minhas trilhas
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── ESTILOS COMPARTILHADOS ────────────────── */

const tituloPergunta: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: "var(--text-color)",
  margin: "0 0 14px",
};

const descricaoPergunta: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  lineHeight: 1.5,
  margin: "-6px 0 16px",
};

const listaOpcoes: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

function opcaoStyle(selecionada: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 11,
    border: selecionada ? "1px solid #818cf8" : "1px solid var(--border-color)",
    background: selecionada ? "rgba(99,102,241,0.12)" : "var(--bg-subtle)",
    color: selecionada ? "#818cf8" : "var(--text-color)",
    textAlign: "left",
    fontSize: 13,
    fontWeight: selecionada ? 600 : 400,
    cursor: "pointer",
    transition: "border-color .15s, background .15s",
  };
}