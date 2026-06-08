import { createTrilha, updateTrilha, deleteTrilha, getTrilhas } from '../repositories/playlistRepository'
import { slugify } from '../utils/slugify'

export async function listarTodasTrilhasService() {
  return getTrilhas()
}

export async function criarTrilhaService(data: {
  titulo: string
  slug?: string
  categoriaId: string
  canalId?: string
  youtubePlaylistId?: string
  descricao?: string
  nivel?: string
  destaque?: boolean
  ativa?: boolean
  isCurated?: boolean
}) {
  if (!data.titulo || !data.categoriaId) throw new Error('titulo e categoriaId são obrigatórios')
  const slug = data.slug || slugify(data.titulo)
  return createTrilha({ ...data, slug })
}

export async function editarTrilhaService(id: string, data: {
  titulo?: string
  slug?: string
  categoriaId?: string
  canalId?: string
  youtubePlaylistId?: string
  descricao?: string
  nivel?: string
  destaque?: boolean
  ativa?: boolean
  isCurated?: boolean
}) {
  return updateTrilha(id, data)
}

export async function deletarTrilhaService(id: string) {
  return deleteTrilha(id)
}