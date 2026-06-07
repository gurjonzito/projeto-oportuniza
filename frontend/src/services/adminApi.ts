import api from "./api";

export interface Canal {
  id: string;
  nome: string;
  youtubeChannelId: string;
  descricao?: string;
  thumbnailUrl?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  criadaEm: string;
}

export interface Trilha {
  id: string;
  titulo: string;
  slug: string;
  categoriaNome: string;
  nivel?: string;
  destaque: boolean;
  ativa: boolean;
  isCurated: boolean;
  youtubePlaylistId?: string;
}

export interface Video {
  id: string;
  youtubeVideoId: string;
  titulo: string;
  canal?: { nome: string };
  thumbnailUrl?: string;
  duracao?: string;
  descricao?: string;
  isCurated: boolean;
  tags: string[];
}

export const adminApi = {
  async listarCategorias(): Promise<Categoria[]> {
    const { data } = await api.get("/categorias");
    return data.categorias;
  },

  async criarCategoria(form: {
    nome: string;
    descricao?: string;
  }): Promise<Categoria> {
    return {
      id: Date.now().toString(),
      criadaEm: new Date().toISOString().split("T")[0],
      ...form,
    };
  },
  async editarCategoria(
    id: string,
    form: { nome: string; descricao?: string },
  ): Promise<void> {
    void id;
    void form;
  },
  async deletarCategoria(id: string): Promise<void> {
    void id;
  },

  async listarTrilhas(): Promise<Trilha[]> {
    const { data } = await api.get("/playlist");
    return Array.isArray(data) ? data : (data.trilhas ?? []);
  },

  async criarTrilha(form: Omit<Trilha, "id">): Promise<Trilha> {
    return { id: Date.now().toString(), ...form };
  },
  async editarTrilha(id: string, form: Partial<Trilha>): Promise<void> {
    void id;
    void form;
  },
  async deletarTrilha(id: string): Promise<void> {
    void id;
  },

  // ─── VÍDEOS ────────────────────────────────────────────────────────────────

  async listarVideos(): Promise<Video[]> {
    const { data } = await api.get("/videos");
    return (data.videos ?? []).map((v: any) => ({
      ...v,
      youtubeVideoId: v.videoId ?? v.youtubeVideoId ?? "",
      titulo: v.title ?? v.titulo ?? "",
      canal: v.channel ? { nome: v.channel } : v.canal,
      tags: v.tags ?? [],
      isCurated: v.isCurated ?? false,
    }));
  },

  async toggleCurated(id: string, value: boolean): Promise<void> {
    void id;
    void value;
  },
  async atualizarTags(id: string, tags: string[]): Promise<void> {
    void id;
    void tags;
  },

  // ─── CANAIS ────────────────────────────────────────────────────────────────

  async listarCanais(): Promise<Canal[]> {
    return [];
  },
  async criarCanal(form: Omit<Canal, "id">): Promise<Canal> {
    return { id: Date.now().toString(), ...form };
  },
  async editarCanal(id: string, form: Omit<Canal, "id">): Promise<void> {
    void id;
    void form;
  },
  async deletarCanal(id: string): Promise<void> {
    void id;
  },
};
