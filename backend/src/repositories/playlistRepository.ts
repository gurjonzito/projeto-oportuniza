import { prisma } from '../config/prisma'

export async function getTrilhas() {
  return prisma.trilha.findMany({
    include: {
      categoria: true,
      canal: true,
    },
    orderBy: {
      ordem: 'asc',
    },
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
  const ultimaTrilha = await prisma.trilha.findFirst({
    orderBy: {
      ordem: 'desc',
    },
  })

  return prisma.trilha.create({
    data: {
      ...data,
      ordem: (ultimaTrilha?.ordem ?? -1) + 1,
    },
    include: {
      categoria: true,
    },
  })
}

export async function updateTrilha(
  id: string,
  data: {
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
    ordem?: number
  }
) {
  return prisma.trilha.update({
    where: { id },
    data,
    include: {
      categoria: true,
    },
  })
}

export async function deleteTrilha(id: string) {
  return prisma.trilha.delete({
    where: { id },
  })
}

export async function reorderTrilhas(
  trilhas: {
    id: string
    ordem: number
  }[]
) {
  return prisma.$transaction(
    trilhas.map((trilha) =>
      prisma.trilha.update({
        where: {
          id: trilha.id,
        },
        data: {
          ordem: trilha.ordem,
        },
      })
    )
  )
}