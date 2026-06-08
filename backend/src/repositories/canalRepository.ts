import { prisma } from '../config/prisma'

export async function getCanais() {
  return prisma.canal.findMany({ orderBy: { nome: 'asc' } })
}

export async function findCanalById(id: string) {
  return prisma.canal.findUnique({ where: { id } })
}

export async function findCanalByYoutubeId(youtubeChannelId: string) {
  return prisma.canal.findUnique({ where: { youtubeChannelId } })
}

export async function createCanal(data: { nome: string; youtubeChannelId: string; descricao?: string; thumbnailUrl?: string }) {
  return prisma.canal.create({ data })
}

export async function updateCanal(id: string, data: { nome?: string; youtubeChannelId?: string; descricao?: string; thumbnailUrl?: string }) {
  return prisma.canal.update({ where: { id }, data })
}

export async function deleteCanal(id: string) {
  return prisma.canal.delete({ where: { id } })
}