import { useEffect, useState } from "react";
import Search from "../components/Search";
import ResourceCard from "../components/ResourceCard";
import type { Recurso } from "../types/recurso";
import { getRecursos } from "../services/recursoService";
import Loading from "../components/Loading";

export default function Recursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["todos"]);

  useEffect(() => {
    getRecursos()
      .then((recursosData) => {
        // Apenas recursos ativos aparecem para o usuário
        const recursosAtivos = recursosData.filter((recurso) => recurso.ativo);

        setRecursos(recursosAtivos);

        // Cria automaticamente as categorias
        // existentes nos recursos cadastrados
        const categorias = Array.from(
          new Set(
            recursosAtivos.map((recurso) => recurso.categoria).filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setCategories(["todos", ...categorias]);
      })
      .catch((error) => {
        console.error("Erro ao carregar recursos:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--bg-color)" }}
      >
        <Loading texto="Carregando recursos..." altura="100vh" />
      </div>
    );
  }
  return (
    <Search
      items={recursos}
      loading={loading}
      placeholder="Buscar recursos..."
      itemsPerPage={6}
      categories={categories}
      filterFn={(recurso, search, selectedCategories) => {
        const busca = normalizar(search);

        const matchSearch =
          !busca ||
          normalizar(recurso.nome).includes(busca) ||
          normalizar(recurso.descricao).includes(busca);

        const matchCategoria =
          selectedCategories.includes("todos") ||
          selectedCategories.some(
            (categoria) =>
              normalizar(categoria) === normalizar(recurso.categoria),
          );

        return matchSearch && matchCategoria;
      }}
      renderItem={(recurso) => (
        <ResourceCard
          key={recurso.id}
          nome={recurso.nome}
          descricao={recurso.descricao}
          url={recurso.url}
          categoria={recurso.categoria}
        />
      )}
    />
  );
}
