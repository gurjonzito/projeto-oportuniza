import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const storageKey = `video-progress-${videoId}`;

  const getSavedTime = () => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseFloat(saved) : 0;
  };

  const startTime = getSavedTime();

  // tenta salvar progresso
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "getCurrentTime",
          args: [],
        }),
        "*"
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // escuta mensagens
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;

      try {
        const data = JSON.parse(event.data);

        if (data?.info?.currentTime) {
          localStorage.setItem(
            storageKey,
            data.info.currentTime.toString()
          );
        }
      } catch {
        // ignora
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [storageKey]);

  // 🔥 proteção contra ID inválido
  if (!videoId) {
    return (
      <div className="text-white p-4">
        Vídeo não encontrado (ID inválido)
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl">
      <iframe
        ref={iframeRef}
        className="w-full h-62.5 md:h-120"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&start=${Math.floor(
          startTime
        )}`}
        title={title}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}