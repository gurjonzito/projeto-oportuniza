export interface TrilhaProgress {
  slug: string;
  titulo: string;
  totalVideos: number;
  videosConcluidos: number;
  videosConcluidosIds: string[];
  ultimoAcesso: number;
}

const STORAGE_KEY = "trilhas-progress";
const HIDDEN_KEY = "trilhas-hidden-home";

export function saveTrilhaProgress(progress: TrilhaProgress) {
  const existing: TrilhaProgress[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const updated = [
    progress,
    ...existing.filter(
      (trilha) => trilha.slug !== progress.slug
    ),
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  const hiddenTrilhas: string[] = JSON.parse(
    localStorage.getItem(HIDDEN_KEY) || "[]"
  );

  const updatedHiddenTrilhas = hiddenTrilhas.filter(
    (slug) => slug !== progress.slug
  );

  localStorage.setItem(
    HIDDEN_KEY,
    JSON.stringify(updatedHiddenTrilhas)
  );
}

export function getTrilhasProgress(): TrilhaProgress[] {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );
}

export function getTrilhaProgress(
  slug: string
): TrilhaProgress | undefined {
  return getTrilhasProgress().find(
    (trilha) => trilha.slug === slug
  );
}

export function getTrilhasEmAndamento(): TrilhaProgress[] {
  const hiddenTrilhas: string[] = JSON.parse(
    localStorage.getItem(HIDDEN_KEY) || "[]"
  );

  return getTrilhasProgress()
    .filter(
      (trilha) =>
        trilha.videosConcluidos > 0 &&
        trilha.videosConcluidos < trilha.totalVideos &&
        !hiddenTrilhas.includes(trilha.slug)
    )
    .sort(
      (a, b) => b.ultimoAcesso - a.ultimoAcesso
    );
}

export function removerTrilhaDaHome(slug: string) {
  const hiddenTrilhas: string[] = JSON.parse(
    localStorage.getItem(HIDDEN_KEY) || "[]"
  );

  if (!hiddenTrilhas.includes(slug)) {
    hiddenTrilhas.push(slug);
  }

  localStorage.setItem(
    HIDDEN_KEY,
    JSON.stringify(hiddenTrilhas)
  );
}