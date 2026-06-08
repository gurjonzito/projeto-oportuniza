import { prisma } from '../config/prisma'

export async function getTrilhas() {
  return prisma.trilha.findMany({
    include: { categoria: true, canal: true },
    orderBy: { criadaEm: 'desc' },
  })
}

export async function createTrilha(data: {
  titulo: string
  slug: string
  categoriaId: string
  canalId?: string
  youtubePlaylistId?: string
  descricao?: string
  nivel?: string
  destaque?: boolean
  ativa?: boolean
  isCurated?: boolean
}) {
  return prisma.trilha.create({ data, include: { categoria: true } })
}

export async function updateTrilha(id: string, data: {
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
  return prisma.trilha.update({ where: { id }, data, include: { categoria: true } })
}

export async function deleteTrilha(id: string) {
  return prisma.trilha.delete({ where: { id } })
}