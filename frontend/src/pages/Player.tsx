import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useVideos } from "../hooks/useVideos";
import { Volume2, Download } from "lucide-react";

export default function Player() {
  const { id } = useParams();
  const { videos, loading } = useVideos();

  if (loading) return <p className="p-10">Carregando...</p>;
  if (!id) return <p className="p-10">Vídeo inválido</p>;

  const video = videos.find((v) => v.id === id);

  if (!video) return <p className="p-10">Vídeo não encontrado</p>;

  const handleListen = () => {
    const speech = new SpeechSynthesisUtterance(video.summary);

    speech.lang = "pt-BR";
    speech.rate = 0.95; // velocidade
    speech.pitch = 1; // tom
    speech.volume = 1;

    // tenta escolher uma voz mais natural
    const voices = speechSynthesis.getVoices();
    const vozBR =
      voices.find((v) => v.lang === "pt-BR" && v.name.includes("Google")) ||
      voices.find((v) => v.lang === "pt-BR");

    if (vozBR) speech.voice = vozBR;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // baixar resumo em PDF (simples)
  const handleDownloadSummary = () => {
    const blob = new Blob([video.summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${video.title}.txt`;
    link.click();
  };

  return (
    <div className="bg-[#1E40AF] min-h-screen text-white pb-16">
      <div className="max-w-5xl mx-auto pt-10 px-6">
        <h1 className="text-3xl font-bold mb-6">{video.title}</h1>

        <VideoPlayer videoId={video.videoId} title={video.title} />

        <div className="mt-6 space-y-1">
          <p className="text-sm opacity-90">Canal: {video.channel}</p>
          <p className="text-sm opacity-90">Duração: {video.duration}</p>
        </div>
      </div>

      {/* RESUMO */}
      <div className="bg-gray-100 text-gray-800 mt-12 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4">Resumo</h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <p className="text-gray-600 leading-relaxed">{video.summary}</p>

            {/* BOTÕES */}
            <div className="flex flex-col gap-3 md:items-start">
              <button
                onClick={handleListen}
                className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <Volume2 size={18} />
                Ouvir
              </button>

              <button
                onClick={handleDownloadSummary}
                className="flex items-center gap-2 border border-green-500 text-green-600 px-5 py-2 rounded-lg hover:bg-green-50 transition"
              >
                <Download size={18} />
                Baixar resumo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MATERIAIS COMPLEMENTARES */}
      <div className="bg-blue-100 py-12 text-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Materiais Complementares
          </h2>

          {video.materials && video.materials.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              {video.materials.map((mat, i) => (
                <a
                  key={i}
                  href={mat.file}
                  download
                  className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition border"
                >
                  📄 {mat.name}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Sem conteúdo complementar disponível.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
