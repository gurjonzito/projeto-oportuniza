import api from "./api";

export async function getCategorias(): Promise<string[]> {
  const { data } = await api.get("/categorias");
  return ["todos", ...data.categorias.map((c: { nome: string }) => c.nome.toLowerCase())]
}