import { getCanais, findCanalById, createCanal, updateCanal, deleteCanal } from '../repositories/canalRepository'

export async function listarCanaisService() {
  return getCanais()
}

export async function getActiveChannels() {
  const canais = await getCanais()
  return canais.map((c: Awaited<ReturnType<typeof getCanais>>[number]) => ({
    id: c.id,
    youtubeChannelId: c.youtubeChannelId,
    nome: c.nome,
  }))
}

export async function criarCanalService(data: { nome: string; youtubeChannelId: string; descricao?: string; thumbnailUrl?: string }) {
  if (!data.nome || !data.youtubeChannelId) throw new Error('nome e youtubeChannelId são obrigatórios')
  return createCanal(data)
}

export async function editarCanalService(id: string, data: { nome?: string; youtubeChannelId?: string; descricao?: string; thumbnailUrl?: string }) {
  const canal = await findCanalById(id)
  if (!canal) throw new Error('Canal não encontrado')
  return updateCanal(id, data)
}

export async function deletarCanalService(id: string) {
  const canal = await findCanalById(id)
  if (!canal) throw new Error('Canal não encontrado')
  return deleteCanal(id)
}