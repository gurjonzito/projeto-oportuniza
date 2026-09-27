import { prisma } from '../config/prisma'

// ─── Leitura ─────────────────────────────────────────────────────────────

export async function getTrilhas() {
  return prisma.trilha.findMany({
    include: {
      categoria: { select: { id: true, nome: true, ordem: true } },
      canal: true,
    },
    orderBy: [
      { categoria: { ordem: 'asc' } },
      { ordem: 'asc' },
    ],
  })
}

// ─── Criação ─────────────────────────────────────────────────────────────

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
  // Ordem é calculada DENTRO da categoria
  const ultimaTrilha = await prisma.trilha.findFirst({
    where: { categoriaId: data.categoriaId },
    orderBy: { ordem: 'desc' },
    select: { ordem: true },
  })

  const proximaOrdem = (ultimaTrilha?.ordem ?? -1) + 1

  return prisma.trilha.create({
    data: {
      ...data,
      ordem: proximaOrdem,
    },
    include: {
      categoria: true,
    },
  })
}

// ─── Update ──────────────────────────────────────────────────────────────

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
  // Se mudou de categoria e não passou ordem explícita, joga pro fim da nova categoria
  if (data.categoriaId && data.ordem === undefined) {
    const atual = await prisma.trilha.findUnique({
      where: { id },
      select: { categoriaId: true },
    })

    if (atual && atual.categoriaId !== data.categoriaId) {
      const ultima = await prisma.trilha.findFirst({
        where: { categoriaId: data.categoriaId },
        orderBy: { ordem: 'desc' },
        select: { ordem: true },
      })

      data = { ...data, ordem: (ultima?.ordem ?? -1) + 1 }
    }
  }

  return prisma.trilha.update({
    where: { id },
    data,
    include: {
      categoria: true,
    },
  })
}

// ─── Delete ──────────────────────────────────────────────────────────────

export async function deleteTrilha(id: string) {
  return prisma.trilha.delete({
    where: { id },
  })
}

// ─── Reorder ─────────────────────────────────────────────────────────────

export async function reorderTrilhas(
  trilhas: { id: string; ordem: number }[]
) {
  return prisma.$transaction(
    trilhas.map((trilha) =>
      prisma.trilha.update({
        where: { id: trilha.id },
        data: { ordem: trilha.ordem },
      })
    )
  )
}