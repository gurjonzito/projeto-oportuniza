import { Router } from "express";

import {
  obterUsuarioService,
  atualizarUsuarioService,
} from "../services/userService";

import { userAuth } from "../middleware/userAuth";

const router = Router();

/*
 * GET /user/me
 *
 * Retorna os dados do usuário autenticado.
 */
router.get("/me", userAuth, async (req, res, next) => {
  try {
    const usuario = (req as any).user;

    if (!usuario?.id) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    const dadosUsuario = await obterUsuarioService(usuario.id);

    res.json(dadosUsuario);
  } catch (err) {
    next(err);
  }
});

/*
 * PUT /user/me
 *
 * Atualiza os dados complementares do usuário.
 */
router.put("/me", userAuth, async (req, res, next) => {
  try {
    const usuario = (req as any).user;

    if (!usuario?.id) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    const {
      name,
      telefone,
      dataNascimento,
      cidade,
      estado,
      escolaridade,
      situacaoProfissional,
      objetivoPrincipal,
    } = req.body;

    const dadosAtualizados = await atualizarUsuarioService(
      usuario.id,
      {
        name,
        telefone,
        dataNascimento,
        cidade,
        estado,
        escolaridade,
        situacaoProfissional,
        objetivoPrincipal,
      }
    );

    res.json(dadosAtualizados);
  } catch (err) {
    next(err);
  }
});

export { router as userRoutes };