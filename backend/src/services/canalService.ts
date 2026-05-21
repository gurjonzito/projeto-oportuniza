import { prisma } from "../config/prisma";

export async function getActiveChannels() {
  return prisma.canal.findMany({
    select: {
      id: true,
      nome: true,
      youtubeChannelId: true,
    },
  });
}