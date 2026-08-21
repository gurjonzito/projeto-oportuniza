import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Play, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Trilha } from "../types/trilha";
import { getTrilhas } from "../services/trilhaService";

type GrupoCategoria = {
  numero: number;
  nome: string;
  trilhas: Trilha[];
};

const CATEGORIA_CONFIG: Record<string, { emoji: string; color: string }> = {
  "Emprego":         { emoji: "💼", color: "#3b82f6" },
  "Tecnologia":      { emoji: "💻", color: "#8b5cf6" },
  "Finanças":        { emoji: "🪙", color: "#10b981" },
  "Idiomas":         { emoji: "🌐", color: "#f59e0b" },
  "Negócios":        { emoji: "📊", color: "#ef4444" },
  "Desenvolvimento": { emoji: "🧠", color: "#06b6d4" },
};

const NIVEL_CONFIG: Record<string, { bg: string; color: string }> = {
  "Básico":        { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  "Intermediário": { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  "Avançado":      { bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
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

export default function Trilhas() {
  const [grupos, setGrupos] = useState<GrupoCategoria[]>([]);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTrilhas()
      .then((trilhas) => {
        const mapa = new Map<string, Trilha[]>();
        for (const trilha of trilhas) {
          const cat = trilha.categoria?.nome ?? "Sem categoria";
          if (!mapa.has(cat)) mapa.set(cat, []);
          mapa.get(cat)!.push(trilha);
        }
        setGrupos(
          Array.from(mapa.entries()).map(([nome, trilhas], idx) => ({
            numero: idx + 1,
            nome,
            trilhas,
          }))
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
      >
        Carregando trilhas...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          padding: "48px 20px 40px",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
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
          Aprenda no seu{" "}
          <span style={{ color: "#818cf8" }}>próprio ritmo</span>
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

        {/* Banner IA — placeholder para implementar depois */}
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: 16,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
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
              Em breve
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-color)",
                margin: "0 0 2px",
              }}
            >
              Trilha personalizada com IA
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Diga o que quer aprender e a IA monta sua trilha ideal.
            </p>
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#818cf8",
              background: "rgba(99,102,241,0.15)",
              borderRadius: 999,
              padding: "3px 10px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Em breve
          </span>
        </div>
      </div>

      {/* ── LISTA DE CATEGORIAS ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 60px" }}>
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                {/* Cabeçalho da categoria */}
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
                  {/* Ícone */}
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

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text-color)",
                        margin: "0 0 3px",
                      }}
                    >
                      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 500, marginRight: 6 }}>
                        {grupo.numero}.
                      </span>
                      {grupo.nome}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                      {grupo.trilhas.length} trilha{grupo.trilhas.length !== 1 ? "s" : ""} disponível{grupo.trilhas.length !== 1 ? "is" : ""}
                    </p>
                  </div>

                  {/* Badge + chevron */}
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
                    {grupo.trilhas.length} trilha{grupo.trilhas.length !== 1 ? "s" : ""}
                  </span>

                  {aberto
                    ? <ChevronUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  }
                </button>

                {/* Trilhas dentro */}
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
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-bg)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.color;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-subtle)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-color)";
                          }}
                        >
                          {/* Número */}
                          <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 18, textAlign: "center", flexShrink: 0 }}>
                            {idx + 1}
                          </span>

                          {/* Thumbnail */}
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

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
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
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                          {/* Seta */}
                          <ArrowRight size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
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
    </div>
  );
}