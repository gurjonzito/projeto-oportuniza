import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Palette,
  Accessibility,
  Monitor,
  Moon,
  Sun,
  Zap,
  Check,
  Save,
  ArrowLeft,
} from "lucide-react";

// =========================================================
// TIPOS E PADRÕES
// =========================================================

type Tema = "light" | "dark" | "system";
type TamanhoFonte = "sm" | "md" | "lg";

export interface Preferencias {
  tema: Tema;
  tamanhoFonte: TamanhoFonte;
  reduzirAnimacoes: boolean;
  altoContraste: boolean;
}

export const PADRAO: Preferencias = {
  tema: "system",
  tamanhoFonte: "md",
  reduzirAnimacoes: false,
  altoContraste: false,
};

export const STORAGE_KEY = "oportuniza:preferencias";

// =========================================================
// HELPERS — exportados para uso no App.tsx
// =========================================================

export function aplicarTema(tema: Tema) {
  const root = document.documentElement;
  const prefereEscuro = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const usarEscuro = tema === "dark" || (tema === "system" && prefereEscuro);

  if (usarEscuro) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function aplicarTamanhoFonte(tamanho: TamanhoFonte) {
  const mapa: Record<TamanhoFonte, string> = {
    sm: "14px",
    md: "16px",
    lg: "18px",
  };
  document.documentElement.style.fontSize = mapa[tamanho];
}

export function aplicarAnimacoes(reduzir: boolean) {
  document.documentElement.style.setProperty(
    "--animation-duration",
    reduzir ? "0s" : "0.3s"
  );
  document.body.classList.toggle("reduce-motion", reduzir);
}

export function aplicarAltoContraste(ativo: boolean) {
  document.body.classList.toggle("high-contrast", ativo);
}

/**
 * Lê as preferências do localStorage e devolve um objeto completo.
 * Usado tanto no App.tsx (global) quanto no Preferences.tsx (local).
 */
export function carregarPreferencias(): Preferencias {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      return { ...PADRAO, ...JSON.parse(salvo) };
    }
  } catch (err) {
    console.error("Erro ao carregar preferências:", err);
  }
  return PADRAO;
}

/**
 * Aplica TODAS as preferências de uma vez.
 * Usado no App.tsx ao iniciar a aplicação.
 */
export function aplicarPreferenciasGlobais() {
  const prefs = carregarPreferencias();
  aplicarTema(prefs.tema);
  aplicarTamanhoFonte(prefs.tamanhoFonte);
  aplicarAnimacoes(prefs.reduzirAnimacoes);
  aplicarAltoContraste(prefs.altoContraste);
  return prefs;
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

export default function Preferences() {
  // Inicializa lendo do localStorage, evitando o "flash" de padrão
  const [prefs, setPrefs] = useState<Preferencias>(carregarPreferencias);
  const [message, setMessage] = useState("");

  // Aplica mudanças em tempo real
  useEffect(() => {
    aplicarTema(prefs.tema);
    aplicarTamanhoFonte(prefs.tamanhoFonte);
    aplicarAnimacoes(prefs.reduzirAnimacoes);
    aplicarAltoContraste(prefs.altoContraste);
  }, [
    prefs.tema,
    prefs.tamanhoFonte,
    prefs.reduzirAnimacoes,
    prefs.altoContraste,
  ]);

  // Atualiza uma preferência
  function atualizar<K extends keyof Preferencias>(
    chave: K,
    valor: Preferencias[K]
  ) {
    setPrefs((atual) => ({ ...atual, [chave]: valor }));
  }

  // Salva no localStorage
  function salvar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setMessage("Preferências salvas com sucesso.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar preferências:", err);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        backgroundColor: "var(--bg-color, #f0f7ff)",
        color: "var(--text-color, #111827)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-start gap-3">
          <Link
            to="/user"
            className="mt-1 p-2 rounded-xl border transition hover:bg-black/5 cursor-pointer"
            style={{ borderColor: "var(--border-color, #e5e7eb)" }}
            aria-label="Voltar para a conta"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Preferências</h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-muted, #6b7280)" }}
            >
              Personalize sua experiência no Oportuniza.
            </p>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {message && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium flex items-center gap-2">
            <Check size={16} />
            {message}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* APARÊNCIA */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg, white)",
              borderColor: "var(--border-color, #e5e7eb)",
            }}
          >
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "var(--border-color, #e5e7eb)" }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#1E40AF]/10 flex items-center justify-center">
                <Palette size={18} className="text-[#1E40AF]" />
              </div>
              <div>
                <h2 className="text-base font-bold">Aparência</h2>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  Como o Oportuniza aparece para você.
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Tema */}
              <div>
                <label className="block text-xs font-semibold mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <BotaoTema
                    ativo={prefs.tema === "light"}
                    onClick={() => atualizar("tema", "light")}
                    icon={<Sun size={18} />}
                    label="Claro"
                  />
                  <BotaoTema
                    ativo={prefs.tema === "dark"}
                    onClick={() => atualizar("tema", "dark")}
                    icon={<Moon size={18} />}
                    label="Escuro"
                  />
                  <BotaoTema
                    ativo={prefs.tema === "system"}
                    onClick={() => atualizar("tema", "system")}
                    icon={<Monitor size={18} />}
                    label="Sistema"
                  />
                </div>
              </div>

              {/* Tamanho da fonte */}
              <div>
                <label className="block text-xs font-semibold mb-3">
                  Tamanho do texto
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <BotaoTexto
                    ativo={prefs.tamanhoFonte === "sm"}
                    onClick={() => atualizar("tamanhoFonte", "sm")}
                    tamanho="text-xs"
                    label="Pequeno"
                  />
                  <BotaoTexto
                    ativo={prefs.tamanhoFonte === "md"}
                    onClick={() => atualizar("tamanhoFonte", "md")}
                    tamanho="text-sm"
                    label="Padrão"
                  />
                  <BotaoTexto
                    ativo={prefs.tamanhoFonte === "lg"}
                    onClick={() => atualizar("tamanhoFonte", "lg")}
                    tamanho="text-base"
                    label="Grande"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ACESSIBILIDADE */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg, white)",
              borderColor: "var(--border-color, #e5e7eb)",
            }}
          >
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "var(--border-color, #e5e7eb)" }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#23A6F0]/10 flex items-center justify-center">
                <Accessibility size={18} className="text-[#23A6F0]" />
              </div>
              <div>
                <h2 className="text-base font-bold">Acessibilidade</h2>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  Ajustes para deixar o site mais confortável.
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <Toggle
                icon={<Zap size={16} />}
                titulo="Reduzir animações"
                descricao="Diminui o movimento de transições e efeitos."
                ativo={prefs.reduzirAnimacoes}
                onChange={(v) => atualizar("reduzirAnimacoes", v)}
              />
              <Toggle
                icon={<Accessibility size={16} />}
                titulo="Alto contraste"
                descricao="Aumenta o contraste das cores para leitura."
                ativo={prefs.altoContraste}
                onChange={(v) => atualizar("altoContraste", v)}
              />
            </div>
          </section>

          {/* Botão salvar */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={salvar}
              className="flex items-center gap-2 bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              <Save size={16} />
              Salvar preferências
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// SUB-COMPONENTES
// =========================================================

interface BotaoTemaProps {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function BotaoTema({ ativo, onClick, icon, label }: BotaoTemaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition cursor-pointer ${
        ativo ? "border-[#1E40AF]" : "border-transparent"
      }`}
      style={{
        backgroundColor: ativo
          ? "rgba(30, 64, 175, 0.08)"
          : "var(--bg-subtle, #f3f4f6)",
      }}
    >
      <span className={ativo ? "text-[#1E40AF]" : "opacity-60"}>{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

interface BotaoTextoProps {
  ativo: boolean;
  onClick: () => void;
  tamanho: string;
  label: string;
}

function BotaoTexto({ ativo, onClick, tamanho, label }: BotaoTextoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center py-4 rounded-xl border-2 transition ${tamanho} cursor-pointer ${
        ativo ? "border-[#1E40AF]" : "border-transparent"
      }`}
      style={{
        backgroundColor: ativo
          ? "rgba(30, 64, 175, 0.08)"
          : "var(--bg-subtle, #f3f4f6)",
      }}
    >
      <span className="font-semibold">{label}</span>
    </button>
  );
}

interface ToggleProps {
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  ativo: boolean;
  onChange: (valor: boolean) => void;
  disabled?: boolean;
}

function Toggle({
  icon,
  titulo,
  descricao,
  ativo,
  onChange,
  disabled,
}: ToggleProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: "var(--bg-subtle, #f3f4f6)" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{titulo}</p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-muted, #6b7280)" }}
          >
            {descricao}
          </p>
        </div>
      </div>

      {/* Switch */}
      <button
        type="button"
        onClick={() => !disabled && onChange(!ativo)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full shrink-0 transition ${
          ativo ? "bg-[#1E40AF]" : "bg-gray-300 dark:bg-gray-600"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-checked={ativo}
        role="switch"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            ativo ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}