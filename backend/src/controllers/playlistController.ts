import { Request, Response } from "express";

import {
  importarPlaylistService,
  listarTrilhasService,
  buscarTrilhaService,
} from "../services/playlistService";

export async function importarPlaylist(req: Request, res: Response) {
  try {
    const { url, categoriaId } = req.body;

    const trilha = await importarPlaylistService(url, categoriaId);

    return res.status(201).json({
      message: "Playlist importada com sucesso",

      trilha,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function listarTrilhas(req: Request, res: Response) {
  try {
    const trilhas = await listarTrilhasService();

    return res.json(trilhas);
  } catch {
    return res.status(500).json({
      error: "Erro ao listar trilhas",
    });
  }
}

export async function buscarTrilha(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug)

    const trilha = await buscarTrilhaService(slug);

    if (!trilha) {
      return res.status(404).json({
        error: "Trilha não encontrada",
      });
    }

    return res.json(trilha);
  } catch {
    return res.status(500).json({
      error: "Erro ao buscar trilha",
    });
  }
}
