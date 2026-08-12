import api from "./api";

export async function gerarResumo(videoId: string | undefined): Promise<string> {
  if (!videoId) return "ID do vídeo inválido.";

  try {
    const { data } = await api.get(`/api/resumo/${videoId}`);
    return data.resumo ?? "Resumo indisponível.";
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    return "Não foi possível gerar o resumo. Tente novamente.";
  }
}