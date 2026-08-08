import { useEffect, useState } from "react";

import Search from "../components/Search";
import VideoCard from "../components/VideoCard";

import type { Trilha } from "../types/trilha";

import { getTrilhas } from "../services/trilhaService";
import { getCategorias } from "../services/categoriaService";

export default function Trilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([
    "todos",
  ]);

  useEffect(() => {
    Promise.all([
      getTrilhas(),
      getCategorias(),
    ])
      .then(([trilhasData, categoriasData]) => {
        setTrilhas(trilhasData);
        setCategories(categoriasData);
      })
      .catch((error) => {
        console.error(
          "Erro ao carregar trilhas:",
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Search
      items={trilhas}
      loading={loading}
      placeholder="Buscar trilhas..."
      itemsPerPage={6}
      categories={categories}
      filterFn={(trilha, search, selectedCategories) => {
        const normalizar = (texto: string) =>
          texto
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .toLowerCase();

        const titulo =
          trilha.titulo || "";

        const categoria =
          trilha.categoria?.nome || "";

        const matchSearch =
          normalizar(titulo).includes(
            normalizar(search)
          );

        const matchCategoria =
          selectedCategories.includes(
            "todos"
          ) ||
          selectedCategories.some(
            (cat) =>
              normalizar(cat) ===
              normalizar(categoria)
          );

        return (
          matchSearch &&
          matchCategoria
        );
      }}
      renderItem={(trilha) => (
        <VideoCard
          key={trilha.id}
          title={trilha.titulo}
          thumbnail={
            trilha.thumbnailUrl || ""
          }
          description={
            trilha.descricao
          }
          videos={
            trilha.videos?.length || 0
          }
          slug={trilha.slug}
        />
      )}
    />
  );
}