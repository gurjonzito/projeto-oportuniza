import Search from "../components/Search";
import VideoCard from "../components/VideoCard";
import type { Trilha } from "../types/trilha";
import { trilhasMock } from "../mocks/trilhasMock";

export default function Trilhas() {
  return (
    <Search<Trilha>
      items={trilhasMock}
      placeholder="Buscar trilhas..."
      itemsPerPage={6}
      categories={["todos", "emprego", "tecnologia", "educação", "finanças"]}
      filterFn={(trilha, search, selectedCategories) => {
        const matchSearch = trilha.title.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
          selectedCategories.length === 0 ||
          selectedCategories.includes("todos") ||
          selectedCategories.includes(trilha.category);
        return matchSearch && matchFilter;
      }}
      renderItem={(trilha) => (
        <VideoCard
          key={trilha.id}
          title={trilha.title}
          thumbnail={trilha.thumbnail}
          description={trilha.description}
          videos={trilha.videos} // apenas quantidade de vídeos
        />
      )}
    />
  );
}