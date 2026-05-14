import { prisma } from '../config/prisma'

export async function findCanalByYoutubeId(
  youtubeChannelId: string
) {
  return prisma.canal.findUnique({
    where: {
      youtubeChannelId
    }
  })
}

export async function createCanal(data: any) {
  return prisma.canal.create({
    data
  })
}