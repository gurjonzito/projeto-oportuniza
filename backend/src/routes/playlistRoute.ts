import { Router } from "express";

import {
  importarPlaylist,
  listarTrilhas,
  buscarTrilha,
} from "../controllers/playlistController";

const router = Router();

/*
  IMPORTAR PLAYLIST
*/

router.post("/import", importarPlaylist);

/*
  LISTAR TRILHAS
*/

router.get("/", listarTrilhas);

/*
  DETALHE TRILHA
*/

router.get("/:slug", buscarTrilha);

export default router;
