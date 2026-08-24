import { prisma } from "../config/prisma";

export async function listarTrilhasEmAndamento(userId: string) {
  return prisma.trilhaProgress.findMany({
    where: {
      userId,
      videosConcluidos: {
        some: {},
      },
    },

    include: {
      trilha: {
        include: {
          videos: true,
        },
      },

      videosConcluidos: {
        include: {
          video: true,
        },
      },
    },

    orderBy: {
      ultimoAcesso: "desc",
    },
  });
}

export async function findTrilhaProgress(
  userId: string,
  trilhaId: string
) {
  return prisma.trilhaProgress.findUnique({
    where: {
      userId_trilhaId: {
        userId,
        trilhaId,
      },
    },

    include: {
      trilha: {
        include: {
          videos: true,
        },
      },

      videosConcluidos: {
        include: {
          video: true,
        },
      },
    },
  });
}

export async function findTrilhaBySlug(slug: string) {
  return prisma.trilha.findUnique({
    where: {
      slug,
    },

    include: {
      videos: {
        include: {
          video: true,
        },
      },
    },
  });
}

export async function createTrilhaProgress(
  userId: string,
  trilhaId: string
) {
  return prisma.trilhaProgress.create({
    data: {
      userId,
      trilhaId,
    },
  });
}

export async function updateTrilhaProgressAcesso(
  progressId: string
) {
  return prisma.trilhaProgress.update({
    where: {
      id: progressId,
    },

    data: {
      ultimoAcesso: new Date(),
    },
  });
}

export async function findVideoProgress(
  progressId: string,
  videoId: string
) {
  return prisma.videoProgress.findUnique({
    where: {
      progressId_videoId: {
        progressId,
        videoId,
      },
    },
  });
}

export async function createVideoProgress(
  progressId: string,
  videoId: string
) {
  return prisma.videoProgress.create({
    data: {
      progressId,
      videoId,
    },
  });
}

export async function deleteVideoProgress(
  progressId: string,
  videoId: string
) {
  return prisma.videoProgress.delete({
    where: {
      progressId_videoId: {
        progressId,
        videoId,
      },
    },
  });
}