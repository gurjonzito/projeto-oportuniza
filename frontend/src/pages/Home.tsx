import { BookOpen, PlayCircle, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card";
import {
  getTrilhasEmAndamento,
  removerTrilhaDaHome,
  type TrilhaProgress,
} from "../services/trilhaProgress";

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

function ContinueTrilhas() {
  const navigate = useNavigate();

  const [trilhas, setTrilhas] = useState<TrilhaProgress[]>([]);

  useEffect(() => {
    const trilhasEmAndamento = getTrilhasEmAndamento();

    setTrilhas(trilhasEmAndamento);
  }, []);

  function removerTrilha(slug: string) {
    removerTrilhaDaHome(slug);

    setTrilhas((trilhasAtuais) =>
      trilhasAtuais.filter((trilha) => trilha.slug !== slug)
    );
  }

  if (trilhas.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 transition-colors"
      style={{
        backgroundColor: "var(--bg-color)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="text-sm text-center"
          style={{
            color: "var(--text-color)",
          }}
        >
          Continue aprendendo
        </p>

        <h2
          className="text-2xl md:text-3xl font-semibold text-center mt-2"
          style={{
            color: "var(--text-color)",
          }}
        >
          Continue de onde parou
        </h2>

        <p
          className="text-sm mt-3 mb-12 text-center"
          style={{
            color: "var(--text-color)",
          }}
        >
          Retome suas trilhas e continue evoluindo.
        </p>

        <div
          className={
            trilhas.length === 1
              ? "flex justify-center"
              : "grid md:grid-cols-2 gap-8"
          }
        >
          {trilhas.map((trilha) => {
            const progresso = Math.round(
              (trilha.videosConcluidos / trilha.totalVideos) * 100
            );

            return (
              <Card
                key={trilha.slug}
                className={
                  trilhas.length === 1 ? "w-full max-w-xl" : ""
                }
              >
                <span className="text-blue-500 text-sm font-semibold">
                  Trilha em andamento
                </span>

                <h3
                  className="text-xl font-semibold mt-2"
                  style={{
                    color: "var(--text-color)",
                  }}
                >
                  {trilha.titulo}
                </h3>

                <p
                  className="text-sm mt-2"
                  style={{
                    color: "var(--text-color)",
                  }}
                >
                  {trilha.videosConcluidos} de {trilha.totalVideos} aulas
                  concluídas
                </p>

                <div className="mt-5 h-2 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{
                      width: `${progresso}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--text-color)",
                    }}
                  >
                    {progresso}% concluído
                  </span>

                  <button
                    onClick={() => navigate(`/trilhas/${trilha.slug}`)}
                    className="cursor-pointer border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
                  >
                    Continuar →
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between gap-4">
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--text-color)",
                    }}
                  >
                    Não quer continuar agora?
                  </span>

                  <button
                    onClick={() => removerTrilha(trilha.slug)}
                    className="cursor-pointer text-xs text-gray-500 hover:text-red-500 transition"
                  >
                    Remover
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Categorias() {
  const itens = [
    {
      titulo: "Trilhas",
      icon: BookOpen,
    },
    {
      titulo: "Vídeos",
      icon: PlayCircle,
    },
    {
      titulo: "Recursos",
      icon: Link,
    },
  ];

return (
  <section
    className="pb-20 pt-15 transition-colors"
    style={{
      backgroundColor: "var(--bg-color)",
    }}
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
              style={{
                color: "var(--text-color)",
              }}
            >
              {item.titulo}
            </h3>

            <p
              className="text-sm mt-2"
              style={{
                color: "var(--text-color)",
              }}
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