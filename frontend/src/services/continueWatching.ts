export interface ContinueVideo {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  category: string;
  videoUrl: string;
  lastTime: number; // tempo salvo
}

const STORAGE_KEY = "continueWatching";

export function saveContinueWatching(video: ContinueVideo) {
  const existing: ContinueVideo[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const updated = [
    video,
    ...existing.filter((v) => v.id !== video.id),
  ].slice(0, 4);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getContinueWatching(): ContinueVideo[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function getVideoProgress(id: string): ContinueVideo | undefined {
  const existing: ContinueVideo[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return existing.find((v) => v.id === id);
}