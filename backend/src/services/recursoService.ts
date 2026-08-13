import {
  getRecursos,
  findRecursoById,
  createRecurso,
  updateRecurso,
  deleteRecurso
} from '../repositories/recursoRepository'

export async function listarRecursosService() {
  return getRecursos()
}

export async function criarRecursoService(data: {
  nome: string
  descricao: string
  url: string
  categoria: string
  imagemUrl?: string
  ativo?: boolean
}) {
  if (!data.nome?.trim()) {
    throw new Error('Nome é obrigatório')
  }

  if (!data.descricao?.trim()) {
    throw new Error('Descrição é obrigatória')
  }

  if (!data.url?.trim()) {
    throw new Error('URL é obrigatória')
  }

  if (!data.categoria?.trim()) {
    throw new Error('Categoria é obrigatória')
  }

  // Verifica se a URL possui um formato válido
  try {
    new URL(data.url)
  } catch {
    throw new Error('URL inválida')
  }

  return createRecurso({
    nome: data.nome.trim(),
    descricao: data.descricao.trim(),
    url: data.url.trim(),
    categoria: data.categoria.trim(),
    imagemUrl: data.imagemUrl?.trim() || undefined,
    ativo: data.ativo ?? true
  })
}

export async function editarRecursoService(
  id: string,
  data: {
    nome?: string
    descricao?: string
    url?: string
    categoria?: string
    imagemUrl?: string | null
    ativo?: boolean
  }
) {
  const recurso = await findRecursoById(id)

  if (!recurso) {
    throw new Error('Recurso não encontrado')
  }

  if (data.nome !== undefined && !data.nome.trim()) {
    throw new Error('Nome é obrigatório')
  }

  if (data.descricao !== undefined && !data.descricao.trim()) {
    throw new Error('Descrição é obrigatória')
  }

  if (data.url !== undefined) {
    if (!data.url.trim()) {
      throw new Error('URL é obrigatória')
    }

    try {
      new URL(data.url)
    } catch {
      throw new Error('URL inválida')
    }
  }

  if (data.categoria !== undefined && !data.categoria.trim()) {
    throw new Error('Categoria é obrigatória')
  }

  return updateRecurso(id, {
    ...data,
    nome: data.nome?.trim(),
    descricao: data.descricao?.trim(),
    url: data.url?.trim(),
    categoria: data.categoria?.trim(),
    imagemUrl:
      data.imagemUrl === null
        ? null
        : data.imagemUrl?.trim() || undefined
  })
}

export async function deletarRecursoService(id: string) {
  const recurso = await findRecursoById(id)

  if (!recurso) {
    throw new Error('Recurso não encontrado')
  }

  return deleteRecurso(id)
}