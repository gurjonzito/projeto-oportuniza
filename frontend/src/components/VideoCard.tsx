import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  description?: string;
  videos?: number; // para trilha
  channel?: string;
  duration?: string; // para vídeo
  slug?: string;
}

export default function VideoCard({
  title,
  thumbnail,
  description,
  videos,
  channel,
  duration,
  slug,
}: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <div className="card cursor-pointer hover:shadow-lg transition">
      <img src={thumbnail} alt={title} className="w-full h-40 object-cover" />

      <div className="p-4">
        {channel && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{channel}</p>
        )}
        <h3 className="font-semibold text-lg">{title}</h3>
        {duration && <p className="text-sm text-gray-400">{duration} min</p>}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
        {videos !== undefined && (
          <p className="text-sm text-blue-500 mt-2">{videos} vídeos</p>
        )}
        {channel && duration && (
          <button
            onClick={() =>
              slug
                ? navigate(`/trilhas/${slug}`)
                : navigate(`/player/${encodeURIComponent(title)}`)
            }
            className="mt-3 border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition"
          >
            Assistir
          </button>
        )}
      </div>
    </div>
  );
}
