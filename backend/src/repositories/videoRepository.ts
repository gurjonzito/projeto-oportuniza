import { prisma } from '../config/prisma'

export async function findVideoByYoutubeId(youtubeVideoId: string) {
  return prisma.video.findUnique({
    where: { youtubeVideoId }
  })
}

export async function findVideoByYoutubeIdWithDetails(youtubeVideoId: string) {
  return prisma.video.findUnique({
    where: { youtubeVideoId },
    include: {
      canal: { select: { nome: true } }
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

export async function listarTodosVideos() {
  return prisma.video.findMany({
    where: {
      trilhas: {
        none: {}, // exclui vídeos que têm pelo menos uma trilha associada
      },
    },
    include: {
      canal: true,
    },
    orderBy: {
      cachedEm: "desc",
    },
  });
}

// ⚠️ NOVA FUNÇÃO: lista todos os vídeos curados (para a página pública /videos)
export async function listarVideosCurados() {
  return prisma.video.findMany({
    where: { isCurated: true },
    include: {
      canal: true,
    },
    orderBy: {
      cachedEm: "desc",
    },
  });
}

export async function createVideo(data: any) {
  return prisma.video.create({ data })
}

export async function findVideosByIds(ids: string[]) {
  return prisma.video.findMany({
    where: {
      id: { in: ids }
    },
    include: {
      canal: true
    }
  })
}

export async function findCuratedVideosByIds(ids: string[]) {
  return prisma.video.findMany({
    where: {
      id: { in: ids },
      isCurated: true,
    },
    include: {
      canal: true,
    },
  });
}

export async function updateVideoCurated(id: string, isCurated: boolean) {
  return prisma.video.update({ where: { id }, data: { isCurated } })
}

export async function updateVideoTags(id: string, tags: string[]) {
  return prisma.video.update({ where: { id }, data: { tags } })
}