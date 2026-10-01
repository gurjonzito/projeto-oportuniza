import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function gerarPaginas(
  currentPage: number,
  totalPages: number,
  maxVisiveis = 5
): (number | "...")[] {
  if (totalPages <= maxVisiveis + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const paginas: (number | "...")[] = [];
  const metade = Math.floor(maxVisiveis / 2);

  let inicio = Math.max(1, currentPage - metade);
  let fim = Math.min(totalPages, currentPage + metade);

  if (currentPage <= metade) {
    fim = maxVisiveis;
  } else if (currentPage >= totalPages - metade) {
    inicio = totalPages - maxVisiveis + 1;
  }

  if (inicio > 1) {
    paginas.push(1);
    if (inicio > 2) paginas.push("...");
  }

  for (let i = inicio; i <= fim; i++) {
    paginas.push(i);
  }

  if (fim < totalPages) {
    if (fim < totalPages - 1) paginas.push("...");
    paginas.push(totalPages);
  }

  return paginas;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  function handleMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  useEffect(() => {
    if (!scrollRef.current) return;
    const ativo = scrollRef.current.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    if (ativo) {
      ativo.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const paginas = gerarPaginas(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 mb-6 flex items-center justify-center w-full max-w-3xl mx-auto"
    >
      <div
        className="
          flex items-center gap-1
          px-2 py-1.5
          rounded-2xl
          backdrop-blur-sm
        "
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Botão anterior */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="
            w-8 h-8 rounded-lg
            flex items-center justify-center
            transition-all duration-150
            disabled:opacity-30
            disabled:cursor-not-allowed
            cursor-pointer
          "
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = "var(--hover-bg)";
              e.currentTarget.style.color = "#1E40AF";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Divisor */}
        <div
          className="w-px h-5 mx-0.5"
          style={{ backgroundColor: "var(--border-color)" }}
        />

        {/* Lista */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`
            flex items-center gap-0.5
            overflow-x-auto
            px-1
            scrollbar-hide
            select-none
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maxWidth: "100%",
          }}
        >
          {paginas.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="
                    w-8 h-8 flex items-center justify-center
                    text-xs font-bold select-none
                  "
                  style={{ color: "var(--text-muted)" }}
                >
                  ···
                </span>
              );
            }

            const isActive = currentPage === p;

            return (
              <button
                key={p}
                data-active={isActive}
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                className={`
                  shrink-0
                  min-w-8 h-8
                  px-2.5
                  rounded-lg
                  text-[13px]
                  font-semibold
                  transition-all duration-150
                  cursor-pointer
                `}
                style={{
                  backgroundColor: isActive ? "#1E40AF" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-color)",
                  boxShadow: isActive
                    ? "0 2px 10px rgba(30,64,175,0.45)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                    e.currentTarget.style.color = "#1E40AF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-color)";
                  }
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Divisor */}
        <div
          className="w-px h-5 mx-0.5"
          style={{ backgroundColor: "var(--border-color)" }}
        />

        {/* Botão próximo */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className="
            w-8 h-8 rounded-lg
            flex items-center justify-center
            transition-all duration-150
            disabled:opacity-30
            disabled:cursor-not-allowed
            cursor-pointer
          "
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = "var(--hover-bg)";
              e.currentTarget.style.color = "#1E40AF";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}