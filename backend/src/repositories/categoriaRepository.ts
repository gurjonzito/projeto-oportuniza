import { prisma } from '../config/prisma'

export async function getCategorias() {
  return prisma.categoria.findMany({
    orderBy: { ordem: 'asc' },
  })
}

export async function createCategoria(data: {
  nome: string
  descricao?: string
}) {
  // Nova categoria sempre entra no fim da lista
  const ultima = await prisma.categoria.findFirst({
    orderBy: { ordem: 'desc' },
    select: { ordem: true },
  })

  const proximaOrdem = (ultima?.ordem ?? -1) + 1

  return prisma.categoria.create({
    data: { ...data, ordem: proximaOrdem },
  })
}

export async function findCategoriaById(id: string) {
  return prisma.categoria.findUnique({ where: { id } })
}

export async function updateCategoria(
  id: string,
  data: { nome?: string; descricao?: string }
) {
  return prisma.categoria.update({ where: { id }, data })
}

export async function deleteCategoria(id: string) {
  return prisma.categoria.delete({ where: { id } })
}

export async function reorderCategorias(
  categorias: { id: string; ordem: number }[]
) {
  return prisma.$transaction(
    categorias.map((c) =>
      prisma.categoria.update({
        where: { id: c.id },
        data: { ordem: c.ordem },
      })
    )
  )
}