export interface TrilhaVideo {
  id: string;
  ordem: number;
  video: {
    id: string;
    titulo: string;
    descricao?: string;
    thumbnailUrl?: string;
    youtubeVideoId: string;
    canal: {
      nome: string;
    };
  };
}

export interface Trilha {
  id: string;
  titulo: string;
  slug: string;
  descricao?: string;
  thumbnailUrl?: string;
  nivel?: string;
  ordem?: number;

  categoriaId: string;
  categoria?: {
    id?: string;
    nome: string;
    ordem?: number;
  };

  canalId?: string;
  canal?: {
    id: string;
    nome: string;
    thumbnailUrl?: string;
  };

  youtubePlaylistId?: string;
  duracaoTotalSegundos?: number;

  destaque: boolean;
  ativa: boolean;
  isCurated: boolean;

  criadaEm?: string;

  videos?: TrilhaVideo[];
}