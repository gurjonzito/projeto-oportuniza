import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Pagination from "./Pagination";

interface SearchProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  filterFn?: (item: T, search: string, categories: string[]) => boolean;
  placeholder?: string;
  itemsPerPage?: number;
  categories?: string[];
  loading?: boolean;
  onSearch?: (query: string, categories: string[]) => void | Promise<void>;
  extraFilter?: React.ReactNode; // ← novo
}

export default function Search<T>({
  items = [],
  renderItem,
  filterFn,
  placeholder = "Pesquisar...",
  itemsPerPage = 6,
  categories = [],
  loading = false,
  onSearch,
  extraFilter, // ← novo
}: SearchProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["todos"]);
  const [page, setPage] = useState(1);

  const toggleCategory = async (category: string) => {
    let updatedCategories: string[] = [];
    const categoriesWithoutTodos = categories.filter((cat) => cat !== "todos");

    if (category === "todos") {
      updatedCategories = ["todos"];
    } else {
      const selectedWithoutTodos = selectedCategories.filter((c) => c !== "todos");

      if (selectedWithoutTodos.includes(category)) {
        updatedCategories = selectedWithoutTodos.filter((c) => c !== category);
      } else {
        updatedCategories = [...selectedWithoutTodos, category];
      }

      if (updatedCategories.length === categoriesWithoutTodos.length) {
        updatedCategories = ["todos"];
      }

      if (updatedCategories.length === 0) {
        updatedCategories = ["todos"];
      }
    }

    setSelectedCategories(updatedCategories);
    setPage(1);

    if (onSearch) await onSearch(search, updatedCategories);
  };

  const filteredItems = (items || []).filter((item) => {
    if (filterFn) {
      try {
        return filterFn(item, search, selectedCategories);
      } catch (error) {
        console.error("Erro no filterFn:", error);
        return true;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const displayedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--bg-color)" }}>

      {/* BUSCA */}
      <div className="max-w-2xl mx-auto mb-6 relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={async (e) => {
            const value = e.target.value;
            setSearch(value);
            setPage(1);
            if (onSearch) await onSearch(value, selectedCategories);
          }}
          className="w-full pl-10 p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          style={{ color: "var(--text-color)", borderColor: "var(--text-color)" }}
        />
      </div>

      {/* CATEGORIAS + FILTRO EXTRA */}
      {categories.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">

          <h3 className="font-semibold mb-4" style={{ color: "var(--text-color)" }}>
            Categorias
          </h3>

          {/* Categorias e dropdown na mesma linha */}
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => {
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border transition
              ${selected ? "bg-blue-600 text-white border-blue-600" : ""}`}
                  style={
                    !selected
                      ? {
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                        borderColor: "rgba(128,128,128,.3)",
                      }
                      : {}
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}

            {/* Dropdown separado por divisor sutil */}
            {extraFilter && (
              <>
                <div className="w-px h-6 bg-gray-600 mx-1" />
                {extraFilter}
              </>
            )}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10">
          <p style={{ color: "var(--text-color)" }}>Carregando vídeos...</p>
        </div>
      )}

      {/* SEM RESULTADOS */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p style={{ color: "var(--text-color)" }}>Nenhum vídeo encontrado.</p>
        </div>
      )}

      {/* GRID */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {displayedItems.map((item, index) => (
            <div key={index} className="flex flex-col h-full">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}

      {/* PAGINAÇÃO */}
      {!loading && filteredItems.length > 0 && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}