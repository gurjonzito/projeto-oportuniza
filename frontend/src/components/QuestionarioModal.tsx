import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import type { RespostasQuestionario } from "../services/recomendacaoService";

type Props = {
  onClose: () => void;
  onConcluir: (respostas: RespostasQuestionario) => Promise<void>;
};

const AREAS_DISPONIVEIS = [
  "Emprego",
  "Tecnologia",
  "Finanças",
  "Idiomas",
  "Negócios",
  "Desenvolvimento",
];

type Opcao = { valor: string; label: string; emoji: string };

const OBJETIVOS: Opcao[] = [
  { valor: "emprego",   label: "Conseguir emprego",      emoji: "💼" },
  { valor: "carreira",  label: "Crescer na carreira",    emoji: "📈" },
  { valor: "estudo",    label: "Aprender por interesse", emoji: "📚" },
];

const NIVEIS: Opcao[] = [
  { valor: "iniciante",      label: "Iniciante",      emoji: "🌱" },
  { valor: "intermediario",  label: "Intermediário",   emoji: "🔥" },
  { valor: "avancado",       label: "Avançado",        emoji: "⚡" },
];

const TEMPOS: Opcao[] = [
  { valor: "menos_de_2h",  label: "Menos de 2h/semana", emoji: "⏱️" },
  { valor: "2_a_5h",       label: "Entre 2h e 5h",      emoji: "🕐" },
  { valor: "mais_de_5h",   label: "Mais de 5h/semana",  emoji: "🚀" },
];

export default function QuestionarioModal({ onClose, onConcluir }: Props) {
  const [step, setStep] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [objetivo, setObjetivo] = useState("");
  const [nivel, setNivel] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [tempo, setTempo] = useState("");

  const steps = ["Objetivo", "Nível", "Áreas", "Tempo"];

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function podeProsseguir() {
    if (step === 0) return !!objetivo;
    if (step === 1) return !!nivel;
    if (step === 2) return areas.length > 0;
    if (step === 3) return !!tempo;
    return false;
  }

  async function handleConcluir() {
    setCarregando(true);
    setErro(null);
    try {
      await onConcluir({ objetivo, nivel, areas, tempoSemanal: tempo });
      onClose();
    } catch {
      setErro("Não foi possível gerar as recomendações. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(99,102,241,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818cf8",
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-color)", margin: 0 }}>
              Descobrir minhas trilhas
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              {step + 1} de {steps.length} — {steps[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
              borderRadius: 8,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, backgroundColor: "var(--border-color)" }}>
          <div
            style={{
              height: "100%",
              width: `${((step + 1) / steps.length) * 100}%`,
              backgroundColor: "#818cf8",
              transition: "width .3s ease",
              borderRadius: 999,
            }}
          />
        </div>

        {/* Conteúdo */}
        <div style={{ padding: "28px 24px 24px" }}>

          {/* Step 0 — Objetivo */}
          {step === 0 && (
            <StepOpcoes
              titulo="Qual é o seu objetivo principal?"
              opcoes={OBJETIVOS}
              selecionado={objetivo}
              onSelecionar={setObjetivo}
            />
          )}

          {/* Step 1 — Nível */}
          {step === 1 && (
            <StepOpcoes
              titulo="Qual é o seu nível de conhecimento atual?"
              opcoes={NIVEIS}
              selecionado={nivel}
              onSelecionar={setNivel}
            />
          )}

          {/* Step 2 — Áreas */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-color)", marginBottom: 16 }}>
                Quais áreas te interessam?
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, marginTop: -10 }}>
                Selecione uma ou mais.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AREAS_DISPONIVEIS.map((area) => {
                  const ativo = areas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        border: `1px solid ${ativo ? "#818cf8" : "var(--border-color)"}`,
                        backgroundColor: ativo ? "rgba(99,102,241,0.15)" : "var(--bg-subtle)",
                        color: ativo ? "#818cf8" : "var(--text-color)",
                        fontSize: 13,
                        fontWeight: ativo ? 600 : 400,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Tempo */}
          {step === 3 && (
            <StepOpcoes
              titulo="Quanto tempo você tem por semana para estudar?"
              opcoes={TEMPOS}
              selecionado={tempo}
              onSelecionar={setTempo}
            />
          )}

          {/* Erro */}
          {erro && (
            <p style={{ fontSize: 12, color: "#ef4444", marginTop: 12, textAlign: "center" }}>
              {erro}
            </p>
          )}

          {/* Botões de navegação */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 28,
              justifyContent: "space-between",
            }}
          >
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={15} /> Voltar
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!podeProsseguir()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: podeProsseguir() ? "#818cf8" : "var(--border-color)",
                  color: podeProsseguir() ? "#fff" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: podeProsseguir() ? "pointer" : "not-allowed",
                  transition: "background .15s",
                }}
              >
                Próximo <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleConcluir}
                disabled={!podeProsseguir() || carregando}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: podeProsseguir() && !carregando ? "#818cf8" : "var(--border-color)",
                  color: podeProsseguir() && !carregando ? "#fff" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: podeProsseguir() && !carregando ? "pointer" : "not-allowed",
                  transition: "background .15s",
                  minWidth: 160,
                  justifyContent: "center",
                }}
              >
                {carregando ? (
                  <>
                    <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Ver minhas trilhas
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* Sub-componente reutilizável para steps de seleção única */
function StepOpcoes({
  titulo,
  opcoes,
  selecionado,
  onSelecionar,
}: {
  titulo: string;
  opcoes: Opcao[];
  selecionado: string;
  onSelecionar: (v: string) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-color)", marginBottom: 16 }}>
        {titulo}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opcoes.map((op) => {
          const ativo = selecionado === op.valor;
          return (
            <button
              key={op.valor}
              onClick={() => onSelecionar(op.valor)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 14,
                border: `1px solid ${ativo ? "#818cf8" : "var(--border-color)"}`,
                backgroundColor: ativo ? "rgba(99,102,241,0.1)" : "var(--bg-subtle)",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--text-color)",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 22 }}>{op.emoji}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: ativo ? 600 : 400,
                  color: ativo ? "#818cf8" : "var(--text-color)",
                }}
              >
                {op.label}
              </span>
              {ativo && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}