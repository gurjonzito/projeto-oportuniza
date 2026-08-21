import {
  findUserById,
  updateUser,
  upsertUserProfile,
} from "../repositories/userRepository";

import { gerarPresignedUrl } from "../routes/fotoRoute";

const URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 dias
const RENOVAR_ANTES_DE_MS = 1000 * 60 * 60 * 24; // renova se faltar < 1 dia

interface AtualizarUsuarioData {
  name?: string;
  telefone?: string | null;
  dataNascimento?: string | null;
  cidade?: string | null;
  estado?: string | null;
  escolaridade?: string | null;
  situacaoProfissional?: string | null;
  objetivoPrincipal?: string | null;
}

// =========================================================
// HELPER — renova presigned URL se estiver perto de expirar
// Atualiza o banco e devolve o usuário com a URL já renovada
// =========================================================

async function renovarUrlSeNecessario(
  usuario: NonNullable<Awaited<ReturnType<typeof findUserById>>>
) {
  const { id, imageKey, imageUrlExpiresAt } = usuario;

  const deveRenovar =
    imageKey &&
    imageUrlExpiresAt &&
    imageUrlExpiresAt.getTime() - Date.now() < RENOVAR_ANTES_DE_MS;

  if (!deveRenovar) return usuario;

  const novaUrl = await gerarPresignedUrl(imageKey);
  const novaExpiracao = new Date(Date.now() + URL_EXPIRY_SECONDS * 1000);

  await updateUser(id, {
    image: novaUrl,
    imageUrlExpiresAt: novaExpiracao,
  });

  return { ...usuario, image: novaUrl, imageUrlExpiresAt: novaExpiracao };
}

// =========================================================
// SERVICES
// =========================================================

export async function obterUsuarioService(userId: string) {
  const usuario = await findUserById(userId);

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  return renovarUrlSeNecessario(usuario);
}

export async function atualizarUsuarioService(
  userId: string,
  data: AtualizarUsuarioData
) {
  const usuario = await findUserById(userId);

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  // =========================
  // DADOS DO USER
  // =========================

  if (data.name !== undefined) {
    const nome = data.name.trim();

    if (!nome) {
      throw new Error("Nome é obrigatório");
    }

    if (nome.length < 2) {
      throw new Error("Nome deve possuir pelo menos 2 caracteres");
    }

    await updateUser(userId, { name: nome });
  }

  // =========================
  // DATA DE NASCIMENTO
  // =========================

  let dataNascimento: Date | null | undefined;

  if (data.dataNascimento !== undefined) {
    if (!data.dataNascimento) {
      dataNascimento = null;
    } else {
      const dataConvertida = new Date(data.dataNascimento);

      if (isNaN(dataConvertida.getTime())) {
        throw new Error("Data de nascimento inválida");
      }

      dataNascimento = dataConvertida;
    }
  }

  // =========================
  // USER PROFILE
  // =========================

  const possuiDadosPerfil =
    data.telefone !== undefined ||
    data.dataNascimento !== undefined ||
    data.cidade !== undefined ||
    data.estado !== undefined ||
    data.escolaridade !== undefined ||
    data.situacaoProfissional !== undefined ||
    data.objetivoPrincipal !== undefined;

  if (possuiDadosPerfil) {
    await upsertUserProfile(userId, {
      telefone:
        data.telefone !== undefined
          ? data.telefone?.trim() || null
          : undefined,

      dataNascimento,

      cidade:
        data.cidade !== undefined
          ? data.cidade?.trim() || null
          : undefined,

      estado:
        data.estado !== undefined
          ? data.estado?.trim() || null
          : undefined,

      escolaridade:
        data.escolaridade !== undefined
          ? data.escolaridade?.trim() || null
          : undefined,

      situacaoProfissional:
        data.situacaoProfissional !== undefined
          ? data.situacaoProfissional?.trim() || null
          : undefined,

      objetivoPrincipal:
        data.objetivoPrincipal !== undefined
          ? data.objetivoPrincipal?.trim() || null
          : undefined,
    });
  }

  const usuarioAtualizado = await findUserById(userId);
  return renovarUrlSeNecessario(usuarioAtualizado!);
}