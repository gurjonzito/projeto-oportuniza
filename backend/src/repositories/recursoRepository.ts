import { prisma } from '../config/prisma'

export async function getRecursos() {
  return prisma.recurso.findMany({
    orderBy: {
      nome: 'asc'
    }
  })
}

export async function createRecurso(data: {
  nome: string
  descricao: string
  url: string
  categoria: string
  imagemUrl?: string
  ativo?: boolean
}) {
  return prisma.recurso.create({
    data
  })
}

export async function findRecursoById(id: string) {
  return prisma.recurso.findUnique({
    where: {
      id
    }
  })
}

export async function updateRecurso(
  id: string,
  data: {
    nome?: string
    descricao?: string
    url?: string
    categoria?: string
    imagemUrl?: string | null
    ativo?: boolean
  }
) {
  return prisma.recurso.update({
    where: {
      id
    },
    data
  })
}

export async function deleteRecurso(id: string) {
  return prisma.recurso.delete({
    where: {
      id
    }
  })
}