import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const NIVEIS = ["todos", "iniciante", "intermediario", "avancado"];

const NIVEL_LABEL: Record<string, string> = {
  todos: "Todos os níveis",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

interface NivelFilterProps {
  nivelSelecionado: string;
  onChange: (nivel: string) => void;
}

export default function NivelFilter({ nivelSelecionado, onChange }: NivelFilterProps) {
  const [aberto, setAberto] = useState(false);
  const [abrirParaCima, setAbrirParaCima] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (aberto && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const espacoAbaixo = window.innerHeight - rect.bottom;
      setAbrirParaCima(espacoAbaixo < 180);
    }
  }, [aberto]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setAberto((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition"
        style={{
          color: "var(--text-color)",
          borderColor: "rgba(128,128,128,.3)",
          backgroundColor: "var(--card-color)",
        }}
      >
        {NIVEL_LABEL[nivelSelecionado]}
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div
          ref={menuRef}
          className="absolute left-0 w-44 rounded-lg border border-gray-600 shadow-lg z-50 overflow-hidden"
          style={{
            backgroundColor: "var(--card-color)",
            ...(abrirParaCima ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }),
          }}
        >
          {NIVEIS.map((nivel) => (
            <button
              key={nivel}
              onClick={() => {
                onChange(nivel);
                setAberto(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-500/20 ${
                nivelSelecionado === nivel ? "text-blue-400 font-semibold" : ""
              }`}
              style={{ color: nivelSelecionado === nivel ? undefined : "var(--text-color)" }}
            >
              {NIVEL_LABEL[nivel]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { NIVEIS, NIVEL_LABEL };