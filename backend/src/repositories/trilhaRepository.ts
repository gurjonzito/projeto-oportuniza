import { prisma } from '../config/prisma'

export async function getTrilhas() {
  return prisma.trilha.findMany({
    include: {
      categoria: true,
      videos: {
        include: {
          video: true
        }
      }
    }
  })
}

export async function findTrilhaById(id: string) {
  return prisma.trilha.findUnique({
    where: {
      id
    },
    include: {
      categoria: true,
      videos: {
        include: {
          video: {
            include: {
              canal: true
            }
          }
        }
      }
    }
  })
}

export async function createTrilha(data: any) {
  return prisma.trilha.create({
    data
  })
}