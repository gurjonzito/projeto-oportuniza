import { prisma } from '../config/prisma'

export async function getCategorias() {
  return prisma.categoria.findMany({
    orderBy: {
      nome: 'asc'
    }
  })
}

export async function createCategoria(data: any) {
  return prisma.categoria.create({
    data
  })
}

export async function findCategoriaById(id: string) {
  return prisma.categoria.findUnique({
    where: {
      id
    }
  })
}

export async function updateCategoria(id: string, data: { nome?: string; descricao?: string }) {
  return prisma.categoria.update({ where: { id }, data })
}

export async function deleteCategoria(id: string) {
  return prisma.categoria.delete({ where: { id } })
}