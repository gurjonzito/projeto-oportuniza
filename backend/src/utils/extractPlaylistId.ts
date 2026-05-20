export function extractPlaylistId(url: string): string | null {
  if (!url) return null;

  // Se já é um ID puro (começa com PL, UU, FL, RD...)
  if (/^(PL|UU|FL|RD|OL)[a-zA-Z0-9_-]+$/.test(url.trim())) {
    return url.trim();
  }

  try {
    // Garante que tem protocolo
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(fullUrl);
    return parsed.searchParams.get("list");
  } catch {
    return null;
  }
}