import { useNavigate } from "react-router-dom";

const NIVEL_STYLE: Record<string, { label: string; className: string }> = {
  "todos os niveis": { label: "Todos os níveis", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  iniciante:     { label: "Iniciante",     className: "bg-green-500/20 text-green-400 border-green-500/30" },
  intermediario: { label: "Intermediário", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  avancado:      { label: "Avançado",      className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface VideoCardProps {
  title: string;
  thumbnail: string;
  description?: string;
  videos?: number;
  channel?: string;
  duration?: string;
  slug?: string;
  videoId?: string;
  nivel?: string;
}

export default function VideoCard({
  title,
  thumbnail,
  description,
  videos,
  channel,
  duration,
  slug,
  videoId,
  nivel,
}: VideoCardProps) {
  const navigate = useNavigate();

  const isTrack = videos !== undefined;
  const isVideo = !!duration;

  const nivelInfo = nivel
    ? NIVEL_STYLE[nivel.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()]
    : null;

  const handleNavigate = () => {
    if (isTrack && slug) {
      navigate(`/trilhas/${encodeURIComponent(slug)}`);
    } else if (videoId) {
      navigate(`/player/${videoId}`);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0
      ? `${truncated.substring(0, lastSpace)}...`
      : `${truncated}...`;
  };

  const limitedDescription = description ? truncateText(description, 120) : undefined;

  return (
    <div
      className="card cursor-pointer hover:shadow-lg transition flex flex-col h-full"
      onClick={handleNavigate}
    >
      {/* Thumbnail */}
      <div className="relative">
        <img src={thumbnail} alt={title} className="w-full h-44 object-cover shrink-0" />
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        {channel && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{channel}</p>
        )}

        {/* Nível */}
        {nivelInfo && (
          <p className="text-xs text-blue-400 mb-1">{nivelInfo.label}</p>
        )}

        <h3
          className="font-semibold text-base leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h3>

        {isVideo && (
          <p className="text-sm text-gray-400 mt-1">{duration} min</p>
        )}

        {limitedDescription && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {limitedDescription}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          {isTrack && (
            <p className="text-sm text-blue-500">{videos} vídeos</p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="cursor-pointer border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition text-sm ml-auto"
          >
            {isTrack ? "Ver trilha" : "Assistir"}
          </button>
        </div>
      </div>
    </div>
  );
}