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

          /* Tema claro */
          bg-white
          border border-gray-200
          shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]

          /* Tema escuro — destacando do fundo #252b42 */
          dark:bg-[#2E3553]
          dark:border-[#414A6B]
          dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]

          backdrop-blur-sm
        "
      >
        {/* Botão anterior */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="
            w-8 h-8 rounded-lg
            flex items-center justify-center

            text-gray-500
            hover:bg-gray-100
            hover:text-[#1E40AF]

            dark:text-gray-300
            dark:hover:bg-white/10
            dark:hover:text-white

            transition-all duration-150
            disabled:opacity-30
            disabled:cursor-not-allowed
            disabled:hover:bg-transparent
            cursor-pointer
          "
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Divisor */}
        <div className="w-px h-5 bg-gray-200 dark:bg-[#414A6B] mx-0.5" />

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
                    text-gray-400
                    dark:text-gray-400
                    text-xs font-bold select-none
                  "
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

                  ${
                    isActive
                      ? `
                        bg-[#1E40AF] text-white
                        shadow-[0_2px_8px_rgba(30,64,175,0.45)]
                        dark:bg-[#1E40AF]
                        dark:text-white
                        dark:shadow-[0_2px_10px_rgba(30,64,175,0.7)]
                      `
                      : `
                        text-gray-600
                        hover:bg-gray-100
                        hover:text-[#1E40AF]

                        dark:text-gray-200
                        dark:hover:bg-white/10
                        dark:hover:text-white
                      `
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Divisor */}
        <div className="w-px h-5 bg-gray-200 dark:bg-[#414A6B] mx-0.5" />

        {/* Botão próximo */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className="
            w-8 h-8 rounded-lg
            flex items-center justify-center

            text-gray-500
            hover:bg-gray-100
            hover:text-[#1E40AF]

            dark:text-gray-300
            dark:hover:bg-white/10
            dark:hover:text-white

            transition-all duration-150
            disabled:opacity-30
            disabled:cursor-not-allowed
            disabled:hover:bg-transparent
            cursor-pointer
          "
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}