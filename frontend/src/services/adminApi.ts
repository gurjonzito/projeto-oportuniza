import api from "./api";

// Habilita envio de cookies em todas as requisições
api.defaults.withCredentials = true;

// Redireciona para login se não autenticado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      window.location.pathname.startsWith("/admin") && // ← essa linha
      !window.location.pathname.includes("/admin/login")
    ) {
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  },
);

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  await api.post("/auth/login", { email, password });
  // sem localStorage — o cookie é setado automaticamente pelo browser
}

export async function logoutAdmin(): Promise<void> {
  await api.post("/auth/logout");
}

export async function checkAuth(): Promise<boolean> {
  try {
    await api.get("/auth/me");
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

export const adminApi = {
  // ─── CATEGORIAS ──────────────────────────────────────────────────────────

  async listarCategorias(): Promise<Categoria[]> {
    const { data } = await api.get("/categorias");
    return data.categorias;
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
    trilhas: {
      id: string;
      ordem: number;
    }[],
  ) {
    const { data } = await api.patch("/playlist/reorder", {
      trilhas,
    });

    return data;
  },

  // ─── VÍDEOS ──────────────────────────────────────────────────────────────

async listarVideos(): Promise<Video[]> {
  const { data } = await api.get("/videos/admin/all"); // ← era "/videos"

  return (data.videos ?? []).map((v: any) => ({
    ...v,
    youtubeVideoId: v.videoId ?? v.youtubeVideoId ?? "",
    titulo: v.title ?? v.titulo ?? "",
    canal: v.channel ? { nome: v.channel } : v.canal,
    tags: v.tags ?? [],
    isCurated: v.isCurated ?? false,
  }));
},

  async toggleCurated(
    id: string,
    value: boolean,
  ): Promise<void> {
    await api.patch(`/videos/${id}/curated`, {
      isCurated: value,
    });
  },

  async atualizarTags(
    id: string,
    tags: string[],
  ): Promise<void> {
    await api.patch(`/videos/${id}/tags`, { tags });
  },

  // ─── CANAIS ──────────────────────────────────────────────────────────────

  async listarCanais(): Promise<Canal[]> {
    const { data } = await api.get("/canais");
    return data.canais;
  },

  async criarCanal(
    form: Omit<Canal, "id">,
  ): Promise<Canal> {
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

  async criarRecurso(
    form: {
      nome: string;
      descricao: string;
      url: string;
      categoria: string;
      imagemUrl?: string;
      ativo: boolean;
    },
  ): Promise<Recurso> {
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