import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  description?: string;
  videos?: number;
  channel?: string;
  duration?: string;
  slug?: string;
  videoId?: string;
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
}: VideoCardProps) {
  const navigate = useNavigate();

  const isTrack = videos !== undefined;
  const isVideo = !!duration;

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

  const limitedDescription = description
    ? truncateText(description, 150)
    : undefined;

  return (
    <div
      className="card cursor-pointer hover:shadow-lg transition"
      onClick={handleNavigate}
    >
      <img src={thumbnail} alt={title} className="w-full h-40 object-cover" />

      <div className="p-4">
        {channel && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {channel}
          </p>
        )}

        <h3 className="font-semibold text-lg">{title}</h3>

        {isVideo && <p className="text-sm text-gray-400">{duration} min</p>}

        {limitedDescription && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {limitedDescription}
          </p>
        )}

        {isTrack && (
          <p className="text-sm text-blue-500 mt-2">{videos} vídeos</p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
          className="cursor-pointer mt-3 border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition"
        >
          {isTrack ? "Ver trilha" : "Assistir"}
        </button>
      </div>
    </div>
  );
}