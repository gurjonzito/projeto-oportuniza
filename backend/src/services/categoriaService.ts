import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  reorderCategorias
} from '../repositories/categoriaRepository'

export async function listarCategoriasService() {
  return getCategorias()
}

export async function criarCategoriaService(data: {
  nome: string
  descricao?: string
}) {
  if (!data.nome) throw new Error('nome é obrigatório')
  return createCategoria(data)
}

export async function editarCategoriaService(
  id: string,
  data: { nome?: string; descricao?: string }
) {
  return updateCategoria(id, data)
}

export async function deletarCategoriaService(id: string) {
  return deleteCategoria(id)
}

export async function reordenarCategoriasService(
  categorias: { id: string; ordem: number }[]
) {
  if (!Array.isArray(categorias) || categorias.length === 0) {
    throw new Error('lista de categorias inválida')
  }
  return reorderCategorias(categorias)
}