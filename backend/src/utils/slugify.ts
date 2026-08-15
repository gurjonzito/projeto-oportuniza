import { blockedTerms } from "./blockedTerms";

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function slugify(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function containsBlockedTerm(text: string): boolean {
  const normalized = normalizeText(text);
  return blockedTerms.some((term) =>
    normalized.includes(normalizeText(term))
  );
}

export function hasBlockedPattern(title: string): boolean {
  if (/#shorts|#short/i.test(title)) return true;

  const emojiCount = (title.match(/\p{Emoji}/gu) ?? []).length;
  if (emojiCount >= 4) return true;

  return false;
}

/** ISO 8601 → segundos. Ex: "PT5M30S" → 330 */
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  return h * 3600 + m * 60 + s;
}

const MIN_DURATION_SECONDS = 120; // 2 minutos

export function shouldBlock(video: {
  title: string;
  description?: string;
  durationSeconds?: number;
}): boolean {
  // Muito curto → short ou teaser
  if (
    video.durationSeconds !== undefined &&
    video.durationSeconds < MIN_DURATION_SECONDS
  ) {
    return true;
  }

  if (containsBlockedTerm(video.title)) return true;
  if (video.description && containsBlockedTerm(video.description)) return true;
  if (hasBlockedPattern(video.title)) return true;

  return false;
}