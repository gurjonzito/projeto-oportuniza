import { Loader2 } from "lucide-react";

interface LoadingProps {
  /** Texto exibido abaixo do spinner. Padrão: "Carregando..." */
  texto?: string;
  /** Altura mínima do container. Padrão: "60vh" */
  altura?: string;
  /** Texto menor de apoio (opcional) */
  subtexto?: string;
}

export default function Loading({
  texto = "Carregando...",
  altura = "60vh",
  subtexto,
}: LoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{
        minHeight: altura,
        backgroundColor: "var(--bg-color, transparent)",
        color: "var(--text-color, #111827)",
      }}
    >
      {/* Spinner com anel animado */}
      <div className="relative flex items-center justify-center">
        {/* Anel externo pulsante */}
        <div
          className="absolute w-16 h-16 rounded-full animate-ping"
          style={{ backgroundColor: "rgba(30, 64, 175, 0.15)" }}
        />

        {/* Círculo com o ícone girando */}
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--card-bg, #ffffff)" }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: "#1E40AF" }}
          />
        </div>
      </div>

      {/* Texto principal */}
      <p className="text-sm font-semibold tracking-wide">{texto}</p>

      {/* Subtexto opcional */}
      {subtexto && (
        <p
          className="text-xs -mt-2"
          style={{ color: "var(--text-muted, #6b7280)" }}
        >
          {subtexto}
        </p>
      )}

      {/* Barra de progresso indeterminada */}
      <div
        className="w-40 h-1 rounded-full overflow-hidden mt-1"
        style={{ backgroundColor: "var(--border-color, #e5e7eb)" }}
      >
        <div
          className="h-full w-1/3 rounded-full"
          style={{
            backgroundColor: "#1E40AF",
            animation: "loadingBar 1.4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Keyframes inline para a barra */}
      <style>{`
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}