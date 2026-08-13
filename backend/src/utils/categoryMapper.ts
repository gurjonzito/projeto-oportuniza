export function detectCategory(title: string): string {
  const lower = title.toLowerCase();

  if (
    lower.includes("excel") ||
    lower.includes("word") ||
    lower.includes("powerpoint")
  ) {
    return "office";
  }

  if (lower.includes("currículo") || lower.includes("curriculo")) {
    return "curriculo";
  }

  if (lower.includes("finanças") || lower.includes("financeira")) {
    return "financas";
  }

  if (
    lower.includes("programação") ||
    lower.includes("react") ||
    lower.includes("javascript")
  ) {
    return "programacao";
  }

  return "geral";
}
