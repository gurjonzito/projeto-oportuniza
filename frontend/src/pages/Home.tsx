import { BookOpen, PlayCircle, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { getContinueWatching } from "../services/continueWatching";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function Home() {
  return (
    <div className="transition-colors">
      <Hero />
      <Categorias />
      <ContinueAprendendo />
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-20 relative transition-colors" style={{ backgroundColor: "#1E40AF", color: "white" }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center text-center md:text-left">
        {/* TEXTO */}
        <div>
          <p className="text-sm text-blue-200 mb-3">
            Aprenda. Evolua. Conquiste.
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            OPORTUNIDADES <br />
            COMEÇAM COM <br />
            CONHECIMENTO
          </h1>

          <div className="mt-8 flex gap-4 justify-center md:justify-start flex-wrap">
            <button
              onClick={() => navigate(`/trilhas`)}
              className="bg-[#23A6F0] text-white font-semibold px-6 py-3 rounded-lg transition hover:bg-[#4fc3f7]"
            >
              Começar
            </button>

            <button
              onClick={() => navigate(`/sobre`)}
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#1E40AF] transition"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        {/* IMAGEM */}
        <div className="flex justify-center">
          <img
            src="/pics/pic-home.jpg"
            className="rounded-3xl shadow-xl w-72"
          />
        </div>
      </div>

      {/* CURVA */}
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

function Categorias() {
  const itens = [
    { titulo: "Trilhas", icon: BookOpen },
    { titulo: "Vídeos", icon: PlayCircle },
    { titulo: "Materiais", icon: Link },
  ];

  return (
    <section className="pb-20 pt-15 transition-colors" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {itens.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.titulo} className="hover:shadow-lg transition">
              <div className="bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center rounded-lg">
                <Icon size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-lg" style={{ color: "var(--text-color)" }}>
                {item.titulo}
              </h3>

              <p className="text-sm mt-2" style={{ color: "var(--text-color)" }}>
                Conteúdos organizados para evolução gradual.
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ContinueAprendendo() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const saved = getContinueWatching();
    setVideos(saved);
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="py-20 transition-colors" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-blue-500 text-sm text-center">
          Continue aprendendo
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold text-center mt-2" style={{ color: "var(--text-color)" }}>
          Continue de onde parou
        </h2>

        <p className="text-sm mt-3 mb-12 text-center" style={{ color: "var(--text-color)" }}>
          Retome seus estudos e continue evoluindo.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <img
                src={video.thumbnail}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              <span className="text-blue-500 text-sm font-semibold">
                {video.category}
              </span>

              <h3 className="font-semibold mt-2" style={{ color: "var(--text-color)" }}>
                {video.title}
              </h3>

              <p className="text-sm mt-2" style={{ color: "var(--text-color)" }}>
                {video.description}
              </p>

              <button className="mt-5 border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                Continuar ▶
              </button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}