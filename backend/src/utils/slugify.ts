import { blockedTerms } from "./blockedTerms";

export function slugify(
  text: string
) {

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export function containsBlockedTerm(text: string) {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return blockedTerms.some((term) =>
    normalized.includes(term)
  );
}