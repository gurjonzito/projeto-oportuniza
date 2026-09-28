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

export async function createCanal(data: {
  nome: string
  youtubeChannelId: string
  descricao?: string
  thumbnailUrl?: string
}) {
  return prisma.canal.create({ data })
}

export async function updateCanal(
  id: string,
  data: {
    nome?: string
    youtubeChannelId?: string
    descricao?: string
    thumbnailUrl?: string
  }
) {
  return prisma.canal.update({ where: { id }, data })
}

/**
 * Deleta um canal, tratando as dependências antes:
 *
 * - Trilhas ficam com `canalId = null` (continuam funcionando)
 * - Vídeos do canal são deletados (não fazem sentido sem o canal)
 * - Relações TrilhaVideo e VideoProgress/Quiz dos vídeos
 *   caem por CASCADE automaticamente
 */
export async function deleteCanal(id: string) {
  return prisma.$transaction(async (tx) => {
    // 1) Desvincula as trilhas (canalId é opcional → pode ir pra null)
    await tx.trilha.updateMany({
      where: { canalId: id },
      data: { canalId: null },
    })

    // 2) Remove os vídeos do canal
    //    TrilhaVideo e VideoProgress/Quiz dos vídeos caem por CASCADE
    await tx.video.deleteMany({
      where: { canalId: id },
    })

    // 3) Agora sim deleta o canal
    return tx.canal.delete({ where: { id } })
  })
}