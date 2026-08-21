import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function SelectCustom({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  disabled = false,
  icon,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // position: relative aqui, sem overflow-hidden em lugar nenhum
    <div ref={ref} style={{ position: "relative" }}>

      {/* Botão trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="auth-input w-full flex items-center gap-2 py-2.5 rounded-xl text-sm text-left transition"
        style={{
          paddingLeft: icon ? "2.5rem" : "1rem",
          paddingRight: "1rem",
          backgroundColor: "var(--card-bg, white)",
          border: "1px solid var(--border-color, #e5e7eb)",
          color: selected
            ? "var(--text-color, #111827)"
            : "var(--text-muted, #9ca3af)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Ícone */}
        {icon && (
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted, #9ca3af)" }}
          >
            {icon}
          </span>
        )}

        <span className="flex-1 truncate">
          {selected ? selected.label : placeholder}
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted, #9ca3af)" }}
        />
      </button>

      {/* Lista — fixed no z-index alto para não ser cortada por overflow-hidden */}
      {open && (
        <ul
          className="absolute left-0 right-0 mt-1 rounded-xl py-1 overflow-y-auto"
          style={{
            zIndex: 9999,
            maxHeight: "240px",
            backgroundColor: "var(--card-bg, white)",
            border: "1px solid var(--border-color, #e5e7eb)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            // Garante que fique por cima de qualquer overflow-hidden do pai
            top: "100%",
          }}
        >
          {/* Opção vazia */}
          <li>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{
                color: "var(--text-muted, #9ca3af)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--hover-bg, rgba(0,0,0,0.04))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {placeholder}
            </button>
          </li>

          {/* Opções */}
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(30, 64, 175, 0.08)"
                      : "transparent",
                    color: isSelected
                      ? "#1E40AF"
                      : "var(--text-color, #111827)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor =
                        "var(--hover-bg, rgba(0,0,0,0.04))";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}