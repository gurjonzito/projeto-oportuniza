import { getCategorias, findCategoriaById, createCategoria, updateCategoria, deleteCategoria } from '../repositories/categoriaRepository'

export async function listarCategoriasService() {
  return getCategorias()
}

export async function criarCategoriaService(data: { nome: string; descricao?: string }) {
  if (!data.nome) throw new Error('Nome é obrigatório')
  return createCategoria(data)
}

export async function editarCategoriaService(id: string, data: { nome?: string; descricao?: string }) {
  const categoria = await findCategoriaById(id)
  if (!categoria) throw new Error('Categoria não encontrada')
  return updateCategoria(id, data)
}

export async function deletarCategoriaService(id: string) {
  const categoria = await findCategoriaById(id)
  if (!categoria) throw new Error('Categoria não encontrada')
  return deleteCategoria(id)
}