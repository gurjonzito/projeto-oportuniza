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

type GrupoCategoria = {
  numero: number;
  nome: string;
  trilhas: Trilha[];
};

const CATEGORIA_CONFIG: Record<string, { emoji: string; color: string }> = {
  Emprego: { emoji: "💼", color: "#3b82f6" },
  Tecnologia: { emoji: "💻", color: "#8b5cf6" },
  Finanças: { emoji: "🪙", color: "#10b981" },
  Idiomas: { emoji: "🌐", color: "#f59e0b" },
  Negócios: { emoji: "📊", color: "#ef4444" },
  Desenvolvimento: { emoji: "🧠", color: "#06b6d4" },
};

const NIVEL_CONFIG: Record<string, { bg: string; color: string }> = {
  Básico: {
    bg: "rgba(16,185,129,0.15)",
    color: "#10b981",
  },
  Intermediário: {
    bg: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
  },
  Avançado: {
    bg: "rgba(239,68,68,0.15)",
    color: "#ef4444",
  },
};

function getCfg(nome: string) {
  return (
    CATEGORIA_CONFIG[nome] ?? {
      emoji: "📚",
      color: "#6366f1",
    }
  );
}

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

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
    setRespostas((prev) => ({
      ...prev,
      objetivo: valor,
    }));
  }

  function selecionarNivel(valor: string) {
    setRespostas((prev) => ({
      ...prev,
      nivel: valor,
    }));
  }

  function alternarArea(valor: string) {
    setRespostas((prev) => {
      const existe = prev.areas.includes(valor);

      if (existe) {
        return {
          ...prev,
          areas: prev.areas.filter((area) => area !== valor),
        };
      }

      return {
        ...prev,
        areas: [...prev.areas, valor],
      };
    });
  }

  function selecionarTempo(valor: string) {
    setRespostas((prev) => ({
      ...prev,
      tempoSemanal: valor,
    }));
  }

  function podeAvancar() {
    if (etapa === 1) {
      return respostas.objetivo !== "";
    }

    if (etapa === 2) {
      return respostas.nivel !== "";
    }

    if (etapa === 3) {
      return respostas.areas.length > 0;
    }

    if (etapa === 4) {
      return respostas.tempoSemanal !== "";
    }

    return false;
  }

  function avancar() {
    if (!podeAvancar()) {
      return;
    }

    if (etapa < 4) {
      setEtapa((prev) => prev + 1);
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa((prev) => prev - 1);
    }
  }

  async function finalizarQuestionario() {
    if (!podeAvancar()) {
      return;
    }

    setCarregandoIA(true);
    setErroIA("");

    try {
      const resultado = await recomendarTrilhas(respostas, todasTrilhas);

      setRecomendacoes(resultado);
      setMostrarQuestionario(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
    setRespostas({
      objetivo: "",
      nivel: "",
      areas: [],
      tempoSemanal: "",
    });

    setRecomendacoes([]);
    setEtapa(1);
    setErroIA("");
    setMostrarQuestionario(true);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        Carregando trilhas...
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
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          padding: "48px 20px 40px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#818cf8",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 999,
            padding: "4px 14px",
            marginBottom: 18,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Plataforma gratuita
        </span>

        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 38px)",
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
            fontSize: 15,
            color: "var(--text-muted)",
            maxWidth: 460,
            margin: "0 auto 32px",
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
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
            cursor: "pointer",
            color: "var(--text-color)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(99,102,241,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#818cf8",
            }}
          >
            <Sparkles size={20} />
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
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
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-color)",
                margin: "0 0 2px",
              }}
            >
              Encontre sua trilha ideal
            </p>

            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Responda algumas perguntas e receba recomendações personalizadas.
            </p>
          </div>

          <ArrowRight
            size={16}
            style={{
              color: "#818cf8",
              flexShrink: 0,
            }}
          />
        </button>
      </div>

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "36px 20px 60px",
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
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 16,
          }}
        >
          Categorias disponíveis
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {grupos.map((grupo) => {
            const aberto = abertos.has(grupo.nome);

            const cfg = getCfg(grupo.nome);

            return (
              <div
                key={grupo.nome}
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 18,
                  overflow: "hidden",
                  transition: "border-color .15s",
                }}
              >
                <button
                  onClick={() => toggleGrupo(grupo.nome)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
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
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: hexAlpha(cfg.color, 0.13),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.emoji}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text-color)",
                        margin: "0 0 3px",
                      }}
                    >
                      <span
                        style={{
                          color: cfg.color,
                          fontSize: 12,
                          fontWeight: 500,
                          marginRight: 6,
                        }}
                      >
                        {grupo.numero}.
                      </span>

                      {grupo.nome}
                    </p>

                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {grupo.trilhas.length} trilha
                      {grupo.trilhas.length !== 1 ? "s" : ""} disponível
                      {grupo.trilhas.length !== 1 ? "is" : ""}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 13px",
                      borderRadius: 999,
                      background: hexAlpha(cfg.color, 0.13),
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    {grupo.trilhas.length} trilha
                    {grupo.trilhas.length !== 1 ? "s" : ""}
                  </span>

                  {aberto ? (
                    <ChevronUp
                      size={16}
                      style={{
                        color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      style={{
                        color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>

                {aberto && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      padding: "14px 16px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {grupo.trilhas.map((trilha, idx) => {
                      const nivel = trilha.nivel ?? "";

                      const nivelCfg = NIVEL_CONFIG[nivel];

                      return (
                        <button
                          key={trilha.id}
                          onClick={() => navigate(`/trilhas/${trilha.slug}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            backgroundColor: "var(--bg-subtle)",
                            border: "1px solid var(--border-color)",
                            borderRadius: 14,
                            padding: "10px 14px 10px 12px",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "var(--text-color)",
                            width: "100%",
                            transition: "background .15s, border-color .15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--hover-bg)";

                            e.currentTarget.style.borderColor = cfg.color;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bg-subtle)";

                            e.currentTarget.style.borderColor =
                              "var(--border-color)";
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              minWidth: 18,
                              textAlign: "center",
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>

                          {trilha.thumbnailUrl ? (
                            <img
                              src={trilha.thumbnailUrl}
                              alt={trilha.titulo}
                              style={{
                                width: 80,
                                height: 52,
                                borderRadius: 10,
                                objectFit: "cover",
                                flexShrink: 0,
                                display: "block",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 80,
                                height: 52,
                                borderRadius: 10,
                                background: hexAlpha(cfg.color, 0.13),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                flexShrink: 0,
                              }}
                            >
                              {cfg.emoji}
                            </div>
                          )}

                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text-color)",
                                margin: "0 0 4px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {trilha.titulo}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                }}
                              >
                                <Play size={10} fill="currentColor" />
                                {trilha.videos?.length ?? 0} vídeos
                              </span>

                              {nivelCfg && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: nivelCfg.bg,
                                    color: nivelCfg.color,
                                  }}
                                >
                                  {nivel}
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight
                            size={15}
                            style={{
                              color: "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {mostrarQuestionario && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
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
              padding: 24,
              position: "relative",
            }}
          >
            {!carregandoIA && (
              <button
                onClick={fecharQuestionario}
                style={{
                  position: "absolute",
                  right: 18,
                  top: 18,
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

            <div
              style={{
                marginBottom: 24,
                paddingRight: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Sparkles
                  size={18}
                  style={{
                    color: "#818cf8",
                  }}
                />

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
                  fontSize: 22,
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

            <div
              style={{
                display: "flex",
                gap: 5,
                marginBottom: 24,
              }}
            >
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
                        style={{
                          animation: "spin 1s linear infinite",
                        }}
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
