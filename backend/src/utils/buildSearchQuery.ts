import { searchKeywords } from "./searchKeywords";

export function buildSearchQuery(termo: string) {
  const lower = termo.toLowerCase();

  /*
    PROCURA CATEGORIA
  */

  for (const category in searchKeywords) {
    const keywords = searchKeywords[category] ?? [];

    const matched = keywords.some((keyword) =>
      lower.includes(keyword.toLowerCase()),
    );

    if (matched) {
      return `
        ${termo}
        ${keywords[0]}
tutorial
profissional
      `;
    }
  }

  /*
    FALLBACK
  */

  return `
    ${termo}
educação
profissional
  `;
}
