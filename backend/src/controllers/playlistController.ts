import { Request, Response } from 'express'
import { importarPlaylistService, listarTrilhasService, buscarTrilhaService } from '../services/playlistService'
import { criarTrilhaService, editarTrilhaService, deletarTrilhaService, listarTodasTrilhasService } from '../services/trilhaService'

export async function importarPlaylist(req: Request, res: Response) {
  try {
    const { url, categoriaId } = req.body
    const trilha = await importarPlaylistService(url, categoriaId)
    return res.status(201).json({ message: 'Playlist importada com sucesso', trilha })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export async function listarTrilhas(req: Request, res: Response) {
  try {
    const trilhas = await listarTrilhasService()
    return res.json(trilhas)
  } catch {
    return res.status(500).json({ error: 'Erro ao listar trilhas' })
  }
}

export async function buscarTrilha(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug)
    const trilha = await buscarTrilhaService(slug)
    if (!trilha) return res.status(404).json({ error: 'Trilha não encontrada' })
    return res.json(trilha)
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar trilha' })
  }
}

export async function listarTodasTrilhas(req: Request, res: Response) {
  try {
    const trilhas = await listarTodasTrilhasService()
    return res.json({ trilhas })
  } catch {
    return res.status(500).json({ error: 'Erro ao listar trilhas' })
  }
}

export async function criarTrilha(req: Request, res: Response) {
  try {
    const trilha = await criarTrilhaService(req.body)
    return res.status(201).json({ trilha })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export async function editarTrilha(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })
    const trilha = await editarTrilhaService(id, req.body)
    return res.json({ trilha })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export async function deletarTrilha(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })
    await deletarTrilhaService(id)
    return res.json({ ok: true })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}