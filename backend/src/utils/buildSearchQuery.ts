import { searchKeywords } from "./searchKeywords";

export interface SearchQuery {
  query: string;
  channelId: string;
}

export function buildSearchQuery(
  termo: string,
  channels: {
    youtubeChannelId: string;
    nome: string;
  }[]
): SearchQuery[] {

  const lower = termo.toLowerCase();

  let extraKeyword = "curso";

  for (const category in searchKeywords) {

    const keywords =
      searchKeywords[category] ?? [];

    const matched = keywords.some((keyword) =>
      lower.includes(keyword.toLowerCase())
    );

    if (matched) {
      extraKeyword = keywords[0] ?? "curso";
      break;
    }
  }

  return channels.map((channel) => ({
    query: `${termo} ${extraKeyword}`,
    channelId: channel.youtubeChannelId,
  }));
}