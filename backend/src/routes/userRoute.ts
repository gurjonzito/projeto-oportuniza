import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";

import {
  obterUsuarioService,
  atualizarUsuarioService,
} from "../services/userService";

import { userAuth } from "../middleware/userAuth";
import { auth } from "../middleware/betterAuth";

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

/*
 * POST /user/me/password
 *
 * Cria uma senha para usuários que ainda não possuem
 * uma conta de credenciais (por exemplo, usuários
 * que entraram originalmente pelo Google).
 */
router.post("/me/password", userAuth, async (req, res, next) => {
  try {
    const usuario = (req as any).user;

    if (!usuario?.id) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({
        error: "A nova senha é obrigatória.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 8 caracteres.",
      });
    }

    await auth.api.setPassword({
      headers: fromNodeHeaders(req.headers),
      body: {
        newPassword,
      },
    });

    return res.json({
      success: true,
      message: "Senha criada com sucesso.",
    });
  } catch (err: any) {
    console.error("Erro ao criar senha:", err);

    return res.status(400).json({
      error: err?.message || "Não foi possível criar a senha.",
    });
  }
});

export { router as userRoutes };