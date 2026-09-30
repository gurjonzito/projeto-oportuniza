import { BookOpen, PlayCircle, Link, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "../components/Card";
import { getTrilhasProgress } from "../services/trilhaProgress";
import type { TrilhaProgress } from "../types/trilhaProgress";
import { useSession } from "../hooks/useSession";

export default function Home() {
  return (
    <>
      <Hero />
      <ContinueTrilhas />
      <Categorias />
    </>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="pt-20 pb-20 relative transition-colors"
      style={{
        backgroundColor: "#1E40AF",
        color: "white",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-medium text-cyan-300 mb-4">
            Aprenda. Evolua. Conquiste.
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            OPORTUNIDADES <br />
            COMEÇAM COM <br />
            CONHECIMENTO
          </h1>

          <div className="mt-8 flex gap-4 justify-center md:justify-start flex-wrap">
            <button
              onClick={() => navigate("/trilhas")}
              className="cursor-pointer bg-[#23A6F0] text-white font-semibold px-6 py-3 rounded-lg transition hover:bg-[#4fc3f7]"
            >
              Começar
            </button>

            <button
              onClick={() => navigate("/sobre")}
              className="cursor-pointer border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#1E40AF] transition"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="/pics/pic-home.jpg"
            className="rounded-3xl shadow-xl w-72"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0">
        <svg
          className="relative block w-full h-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--wave-color)"
            d="M0,160L60,154.7C120,149,240,139,360,122.7C480,107,600,85,720,90.7C840,96,960,128,1080,133.3C1200,139,1320,117,1380,106.7L1440,96V320H0Z"
          />
        </svg>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CARROSSEL DE TRILHAS EM ANDAMENTO
   ═════════════════════════════════════════════════════════════════════ */

function ContinueTrilhas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: loadingSession } = useSession();

  const [trilhas, setTrilhas] = useState<TrilhaProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  // ─── Carrega as trilhas ─────────────────────────────────────
  useEffect(() => {
    if (loadingSession) return;

    if (!isAuthenticated) {
      setTrilhas([]);
      setLoading(false);
      return;
    }

    let cancelado = false;

    async function carregarTrilhas() {
      try {
        setLoading(true);
        const data = await getTrilhasProgress();
        if (cancelado) return;

        // Remove trilhas concluídas (reforço no frontend)
        const emAndamento = data.filter(
          (t) =>
            !(t.totalVideos > 0 && t.videosConcluidos === t.totalVideos)
        );

        setTrilhas(emAndamento);
      } catch (error) {
        if (!cancelado) {
          console.error("Erro ao carregar trilhas em andamento:", error);
          setTrilhas([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregarTrilhas();

    return () => {
      cancelado = true;
    };
  }, [isAuthenticated, loadingSession, location.key]);

  // ─── Atualiza estado das setas conforme o scroll ────────────
  function atualizarSetas() {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setPodeVoltar(scrollLeft > 4);
    setPodeAvancar(scrollLeft + clientWidth < scrollWidth - 4);
  }

  useEffect(() => {
    atualizarSetas();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas);

    return () => {
      el.removeEventListener("scroll", atualizarSetas);
      window.removeEventListener("resize", atualizarSetas);
    };
  }, [trilhas]);

  // ─── Função que rola o carrossel ────────────────────────────
  function scrollPor(direcao: "esquerda" | "direita") {
    const el = scrollRef.current;
    if (!el) return;

    // Largura de um card + gap
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card?.offsetWidth ?? 360;
    const gap = 24;
    const passo = cardWidth + gap;

    el.scrollBy({
      left: direcao === "direita" ? passo : -passo,
      behavior: "smooth",
    });
  }

  // Se terminou de carregar e não há nada, não mostra a seção
  if (!loading && trilhas.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 transition-colors"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* ─── Cabeçalho ──────────────────────────────────── */}
        <p
          className="text-sm text-center"
          style={{ color: "var(--text-color)" }}
        >
          Continue aprendendo
        </p>

        <h2
          className="text-2xl md:text-3xl font-semibold text-center mt-2"
          style={{ color: "var(--text-color)" }}
        >
          Continue de onde parou
        </h2>

        <p
          className="text-sm mt-3 mb-10 text-center"
          style={{ color: "var(--text-color)" }}
        >
          Retome suas trilhas e continue evoluindo.
        </p>

        {/* ─── Carrossel ───────────────────────────────────── */}
        <div className="relative group/carousel">
          {/* Seta ESQUERDA */}
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => scrollPor("esquerda")}
            disabled={!podeVoltar}
            className={`
              hidden md:flex
              absolute left-0 top-1/2 -translate-y-1/2
              z-20
              w-11 h-11 rounded-full
              items-center justify-center
              bg-white/95 dark:bg-[#2E3553]/95
              border border-gray-200 dark:border-[#414A6B]
              text-gray-700 dark:text-gray-200
              shadow-lg
              transition-all duration-200
              hover:scale-110
              hover:bg-white dark:hover:bg-[#2E3553]
              hover:text-[#1E40AF] dark:hover:text-[#818cf8]
              disabled:opacity-0 disabled:pointer-events-none
              cursor-pointer
              -translate-x-1/2
            `}
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* Seta DIREITA */}
          <button
            type="button"
            aria-label="Avançar"
            onClick={() => scrollPor("direita")}
            disabled={!podeAvancar}
            className={`
              hidden md:flex
              absolute right-0 top-1/2 -translate-y-1/2
              z-20
              w-11 h-11 rounded-full
              items-center justify-center
              bg-white/95 dark:bg-[#2E3553]/95
              border border-gray-200 dark:border-[#414A6B]
              text-gray-700 dark:text-gray-200
              shadow-lg
              transition-all duration-200
              hover:scale-110
              hover:bg-white dark:hover:bg-[#2E3553]
              hover:text-[#1E40AF] dark:hover:text-[#818cf8]
              disabled:opacity-0 disabled:pointer-events-none
              cursor-pointer
              translate-x-1/2
            `}
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>

          {/* Gradiente à esquerda (fade) */}
          {podeVoltar && (
            <div
              className="
                hidden md:block
                absolute left-0 top-0 bottom-0 w-16 z-10
                pointer-events-none
                bg-linear-to-r
                from-(--bg-color) to-transparent
              "
            />
          )}

          {/* Gradiente à direita (fade) */}
          {podeAvancar && (
            <div
              className="
                hidden md:block
                absolute right-0 top-0 bottom-0 w-16 z-10
                pointer-events-none
                bg-linear-to-l
                from-(--bg-color) to-transparent
              "
            />
          )}

          {/* ─── Scroll horizontal ──────────────────────── */}
          <div
            ref={scrollRef}
            className="
              flex gap-6
              overflow-x-auto
              scroll-smooth
              snap-x snap-mandatory
              scrollbar-hide
              pb-4
              px-2
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {loading
              ? // ─── Skeletons durante o loading ─────────
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="shrink-0 snap-start w-85 md:w-95 rounded-2xl animate-pulse"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      height: 240,
                    }}
                  />
                ))
              : // ─── Cards reais ──────────────────────────
                trilhas.map((trilha) => {
                  const progresso =
                    trilha.totalVideos > 0
                      ? Math.round(
                          (trilha.videosConcluidos /
                            trilha.totalVideos) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={trilha.slug}
                      data-card
                      className="
                        shrink-0
                        snap-start
                        w-85 md:w-95
                      "
                    >
                      <Card className="h-full">
                        <span className="text-blue-500 text-sm font-semibold">
                          Trilha em andamento
                        </span>

                        <h3
                          className="text-lg font-semibold mt-2 line-clamp-2 min-h-14"
                          style={{ color: "var(--text-color)" }}
                        >
                          {trilha.titulo}
                        </h3>

                        <p
                          className="text-sm mt-2"
                          style={{ color: "var(--text-color)" }}
                        >
                          {trilha.videosConcluidos} de {trilha.totalVideos}{" "}
                          aulas concluídas
                        </p>

                        <div className="mt-5 h-2 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-color)" }}
                          >
                            {progresso}% concluído
                          </span>

                          <button
                            onClick={() =>
                              navigate(`/trilhas/${trilha.slug}`)
                            }
                            className="cursor-pointer border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition text-sm"
                          >
                            Continuar →
                          </button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
          </div>

          {/* ─── Indicador de progresso (bolinhas) ──────── */}
          {!loading && trilhas.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {trilhas.map((t, idx) => (
                <span
                  key={t.slug}
                  className={`
                    w-1.5 h-1.5 rounded-full transition-all
                    ${
                      idx === 0
                        ? "bg-[#1E40AF] w-4"
                        : "bg-gray-300 dark:bg-gray-600"
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Categorias() {
  const itens = [
    { titulo: "Trilhas", icon: BookOpen },
    { titulo: "Vídeos", icon: PlayCircle },
    { titulo: "Recursos", icon: Link },
  ];

  return (
    <section
      className="pb-20 pt-15 transition-colors"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {itens.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.titulo}
              className="hover:shadow-lg transition"
            >
              <div className="bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center rounded-lg">
                <Icon size={26} />
              </div>

              <h3
                className="mt-4 font-semibold text-lg"
                style={{ color: "var(--text-color)" }}
              >
                {item.titulo}
              </h3>

              <p
                className="text-sm mt-2"
                style={{ color: "var(--text-color)" }}
              >
                {item.titulo === "Trilhas" &&
                  "Percursos de aprendizagem organizados por temas, reunindo conteúdos em uma sequência para desenvolver conhecimentos e habilidades profissionais."}

                {item.titulo === "Vídeos" &&
                  "Videoaulas selecionadas para facilitar o aprendizado de forma prática, acessível e objetiva."}

                {item.titulo === "Recursos" &&
                  "Recursos úteis para aprofundar os conhecimentos e apoiar a preparação para o mercado de trabalho."}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}