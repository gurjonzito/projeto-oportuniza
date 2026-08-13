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