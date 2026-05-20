import { useEffect, useState } from "react";

import Search from "../components/Search";

import VideoCard from "../components/VideoCard";

import type { Trilha } from "../types/trilha";

import { getTrilhas } from "../services/trilhaService";

export default function Trilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrilhas()
      .then(setTrilhas)

      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Search<Trilha>
      items={trilhas}
      loading={loading}
      placeholder="Buscar trilhas..."
      itemsPerPage={6}
      categories={["todos", "emprego", "tecnologia", "educação", "finanças"]}
      filterFn={(trilha, search, selectedCategories) => {
        const titulo = trilha.titulo || "";

        const categoria = trilha.categoria?.nome || "";

        const matchSearch = titulo.toLowerCase().includes(search.toLowerCase());

        const matchFilter =
          selectedCategories.length === 0 ||
          selectedCategories.includes("todos") ||
          selectedCategories.includes(categoria.toLowerCase());

        return matchSearch && matchFilter;
      }}
      renderItem={(trilha) => (
        <VideoCard
          key={trilha.id}
          title={trilha.titulo}
          thumbnail={trilha.thumbnailUrl || ""}
          description={trilha.descricao}
          videos={trilha.videos?.length || 0}
          slug={trilha.slug}
        />
      )}
    />
  );
}
