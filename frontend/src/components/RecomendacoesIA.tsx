import { ArrowRight, Play, RefreshCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TrilhaRecomendada } from "../services/recomendacaoService";

type Props = {
  recomendacoes: TrilhaRecomendada[];
  onRefazer: () => void;
};

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

function corCompatibilidade(pct: number): string {
  if (pct >= 75) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function RecomendacoesIA({
  recomendacoes,
  onRefazer,
}: Props) {
  const navigate = useNavigate();

  if (recomendacoes.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 18,
          padding: "24px 20px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            margin: "0 0 14px",
          }}
        >
          Nenhuma trilha compatível encontrada. Tente refazer o questionário.
        </p>

        <button onClick={onRefazer} style={btnRefazerStyle}>
          <RefreshCw size={14} />
          Refazer questionário
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818cf8",
            }}
          >
            <Sparkles size={14} />
          </div>

          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-color)",
              margin: 0,
            }}
          >
            Recomendadas para você
          </p>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#818cf8",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            IA
          </span>
        </div>

        <button onClick={onRefazer} style={btnRefazerStyle}>
          <RefreshCw size={12} />
          Refazer
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {recomendacoes.map(
          ({ trilha, compatibilidade, justificativa }, idx) => {
            const cor = corCompatibilidade(compatibilidade);

            return (
              <button
                key={trilha.id}
                onClick={() => navigate(`/trilhas/${trilha.slug}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text-color)",
                  width: "100%",
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#818cf8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--border-color)";
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#818cf8",
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
                      width: 72,
                      height: 46,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 46,
                      borderRadius: 8,
                      background: "rgba(99,102,241,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    📚
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
                      margin: "0 0 3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {trilha.titulo}
                  </p>

                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      margin: "0 0 4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {justificativa}
                  </p>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}
                  >
                    <Play size={9} fill="currentColor" />
                    {trilha.videos?.length ?? 0} vídeos
                  </span>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: hexAlpha(cor, 0.12),
                      border: `1px solid ${hexAlpha(cor, 0.3)}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: cor,
                        lineHeight: 1,
                      }}
                    >
                      {compatibilidade}
                    </span>

                    <span
                      style={{
                        fontSize: 9,
                        color: cor,
                        fontWeight: 600,
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>

                <ArrowRight
                  size={14}
                  style={{
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          }
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 24,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            backgroundColor: "var(--border-color)",
          }}
        />

        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          todas as trilhas
        </span>

        <div
          style={{
            flex: 1,
            height: 1,
            backgroundColor: "var(--border-color)",
          }}
        />
      </div>
    </div>
  );
}

const btnRefazerStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: "var(--text-muted)",
  background: "transparent",
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  padding: "5px 10px",
  cursor: "pointer",
};