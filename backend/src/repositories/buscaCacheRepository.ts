import { prisma } from '../config/prisma'

export async function findCacheByTerm(termo: string) {
  return prisma.buscaCache.findFirst({
    where: {
      termo
    }
  })
}

export async function createCache(data: any) {
  return prisma.buscaCache.create({
    data
  })
}

export async function updateCache(
  id: string,
  data: any
) {
  return prisma.buscaCache.update({
    where: {
      id
    },
    data
  })
}