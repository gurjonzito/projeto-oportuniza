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

  descricao?: string;

  thumbnailUrl?: string;

  slug: string;

  categoria?: {
    nome: string;
  };

  videos?: TrilhaVideo[];
}