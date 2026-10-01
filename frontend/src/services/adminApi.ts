import api from "./api";

// ⚠️ O withCredentials já está definido em `api.ts`.
// ⚠️ O interceptor de 401 já está definido em `api.ts`.

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  await api.post("/auth/login", { email, password });
}

export async function logoutAdmin(): Promise<void> {
  await api.post("/auth/logout");
}

export async function checkAuth(): Promise<boolean> {
  try {
    // ⚠️ Rota do admin — não conflita mais com /user/me
    await api.get("/auth/admin/me");
    return true;
  } catch {
    return false;
  }
}

export interface Canal {
  id: string;
  nome: string;
  youtubeChannelId: string;
  descricao?: string;
  thumbnailUrl?: string;
}

export interface Categoria {
  id: string;
  ordem?: number;
  nome: string;
  descricao?: string;
  criadaEm: string;
}

export interface Trilha {
  id: string;
  ordem?: number;
  titulo: string;
  slug: string;
  categoriaId: string;
  categoriaNome?: string;
  nivel?: string;
  destaque: boolean;
  ativa: boolean;
  isCurated: boolean;
  youtubePlaylistId?: string;
  descricao?: string;
  thumbnailUrl?: string;
  videos?: { id: string }[];
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

export interface VideoCandidato {
  youtubeVideoId: string;
  channelId?: string;
  titulo: string;
  canal?: string;
  thumbnail?: string;
  descricao?: string;
  publishedAt?: string;
  categoria?: string;
  duracaoSegundos?: number;
  jaExiste: boolean;
  curado: boolean;
}

export interface Recurso {
  id: string;
  nome: string;
  descricao: string;
  url: string;
  categoria: string;
  imagemUrl?: string | null;
  criadoEm: string;
  ativo: boolean;
}

export interface SyncResult {
  ok: boolean;
  adicionados: number;
  atualizados: number;
  removidos: number;
  total: number;
}

export const adminApi = {
  // ─── CATEGORIAS ──────────────────────────────────────────────────────────

  async listarCategorias(): Promise<Categoria[]> {
    const { data } = await api.get("/categorias");
    const lista: Categoria[] = data.categorias ?? [];
    return lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  },

  async criarCategoria(form: {
    nome: string;
    descricao?: string;
  }): Promise<Categoria> {
    const { data } = await api.post("/categorias", form);
    return data.categoria;
  },

  async editarCategoria(
    id: string,
    form: { nome: string; descricao?: string },
  ): Promise<void> {
    await api.put(`/categorias/${id}`, form);
  },

  async deletarCategoria(id: string): Promise<void> {
    await api.delete(`/categorias/${id}`);
  },

  async reordenarCategorias(
    categorias: { id: string; ordem: number }[],
  ): Promise<void> {
    await api.patch("/categorias/reorder", { categorias });
  },

  // ─── TRILHAS ─────────────────────────────────────────────────────────────

  async listarTrilhas(): Promise<Trilha[]> {
    const { data } = await api.get("/playlist/admin");

    return (data.trilhas ?? []).map((t: any) => ({
      ...t,
      categoriaNome: t.categoria?.nome ?? "",
    }));
  },

  async importarPlaylist(
    url: string,
    categoriaId: string,
  ): Promise<Trilha> {
    const { data } = await api.post("/playlist/import", {
      url,
      categoriaId,
    });

    return {
      ...data.trilha,
      categoriaNome: data.trilha.categoria?.nome ?? "",
    };
  },

  async criarTrilha(form: Omit<Trilha, "id">): Promise<Trilha> {
    const { data } = await api.post("/playlist", form);

    return {
      ...data.trilha,
      categoriaNome: data.trilha.categoria?.nome ?? "",
    };
  },

  async editarTrilha(
    id: string,
    form: Partial<Trilha>,
  ): Promise<void> {
    await api.put(`/playlist/${id}`, form);
  },

  async deletarTrilha(id: string): Promise<void> {
    await api.delete(`/playlist/${id}`);
  },

  async reordenarTrilhas(
    trilhas: { id: string; ordem: number }[],
  ): Promise<unknown> {
    const { data } = await api.patch("/playlist/reorder", { trilhas });
    return data;
  },

  async sincronizarTrilha(id: string): Promise<SyncResult> {
    const { data } = await api.post(`/playlist/${id}/sync`);
    return data;
  },

  // ─── VÍDEOS ──────────────────────────────────────────────────────────────

  async listarVideos(): Promise<Video[]> {
    const { data } = await api.get("/videos/admin/all");

    return (data.videos ?? []).map((v: any) => ({
      ...v,
      youtubeVideoId: v.videoId ?? v.youtubeVideoId ?? "",
      titulo: v.title ?? v.titulo ?? "",
      canal: v.canal ? v.canal : v.channel ? { nome: v.channel } : undefined,
      tags: v.tags ?? [],
      isCurated: v.isCurated ?? false,
    }));
  },

  async descobrirVideos(termo: string): Promise<VideoCandidato[]> {
    const { data } = await api.get("/videos/descobrir", {
      params: { termo },
    });

    return (data.videos ?? []).map((v: any) => ({
      youtubeVideoId: v.youtubeVideoId,
      channelId: v.channelId,
      titulo: v.titulo,
      canal: v.canal,
      thumbnail: v.thumbnail,
      descricao: v.descricao,
      publishedAt: v.publishedAt,
      categoria: v.categoria,
      duracaoSegundos: v.duracaoSegundos,
      jaExiste: v.jaExiste ?? false,
      curado: v.curado ?? false,
    }));
  },

  async curarVideo(candidato: VideoCandidato): Promise<Video> {
    const { data } = await api.post("/videos/curar", candidato);
    return data.video;
  },

  async toggleCurated(id: string, value: boolean): Promise<void> {
    await api.patch(`/videos/${id}/curated`, { isCurated: value });
  },

  async atualizarTags(id: string, tags: string[]): Promise<void> {
    await api.patch(`/videos/${id}/tags`, { tags });
  },

  // ─── CANAIS ──────────────────────────────────────────────────────────────

  async listarCanais(): Promise<Canal[]> {
    const { data } = await api.get("/canais");
    return data.canais;
  },

  async criarCanal(form: Omit<Canal, "id">): Promise<Canal> {
    const { data } = await api.post("/canais", form);
    return data.canal;
  },

  async editarCanal(
    id: string,
    form: Omit<Canal, "id">,
  ): Promise<void> {
    await api.put(`/canais/${id}`, form);
  },

  async deletarCanal(id: string): Promise<void> {
    await api.delete(`/canais/${id}`);
  },

  // ─── RECURSOS ───────────────────────────────────────────────────────────

  async listarRecursos(): Promise<Recurso[]> {
    const { data } = await api.get("/recursos");
    return data.recursos ?? [];
  },

  async criarRecurso(form: {
    nome: string;
    descricao: string;
    url: string;
    categoria: string;
    imagemUrl?: string;
    ativo: boolean;
  }): Promise<Recurso> {
    const { data } = await api.post("/recursos", form);
    return data.recurso;
  },

  async editarRecurso(
    id: string,
    form: {
      nome: string;
      descricao: string;
      url: string;
      categoria: string;
      imagemUrl?: string;
      ativo: boolean;
    },
  ): Promise<Recurso> {
    const { data } = await api.put(`/recursos/${id}`, form);
    return data.recurso;
  },

  async deletarRecurso(id: string): Promise<void> {
    await api.delete(`/recursos/${id}`);
  },
};