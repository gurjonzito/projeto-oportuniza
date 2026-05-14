import { prisma } from '../config/prisma'

export async function findVideoByYoutubeId(youtubeVideoId: string) {
  return prisma.video.findUnique({
    where: {
      youtubeVideoId
    }
  })
}

export async function searchVideosByTitle(query: string) {
  return prisma.video.findMany({
    where: {
      titulo: {
        contains: query,
        mode: 'insensitive'
      }
    },
    include: {
      canal: true
    }
  })
}

export async function createVideo(data: any) {
  return prisma.video.create({
    data
  })
}

export async function findVideosByIds(ids: string[]) {
  return prisma.video.findMany({
    where: {
      id: {
        in: ids
      }
    },
    include: {
      canal: true
    }
  })
}