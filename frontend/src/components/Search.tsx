import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Pagination from "./Pagination";

interface SearchProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  filterFn?: (item: T, search: string, categories: string[]) => boolean;
  placeholder?: string;
  itemsPerPage?: number;
  categories?: string[];
}

export default function Search<T>({
  items,
  renderItem,
  filterFn,
  placeholder = "Pesquisar...",
  itemsPerPage = 6,
  categories = [],
}: SearchProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const toggleCategory = (category: string) => {
    if (category === "todos") {
      setSelectedCategories(["todos"]);
    } else {
      setSelectedCategories((prev) => {
        const withoutTodos = prev.filter((c) => c !== "todos");
        return prev.includes(category)
          ? withoutTodos.filter((c) => c !== category)
          : [...withoutTodos, category];
      });
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterFn) {
      return filterFn(item, search, selectedCategories);
    }
    // padrão: busca por título e filtro de categorias se existir
    const title = (item as any).title || "";
    const category = (item as any).category || "";
    const matchSearch = normalizeText(title).includes(normalizeText(search));
    const matchFilter =
      selectedCategories.length === 0 ||
      selectedCategories.includes("todos") ||
      selectedCategories.includes(category);

    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--bg-color)" }}>
      {/* Input de pesquisa */}
      <div className="max-w-2xl mx-auto mb-6 relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          style={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            borderColor: "var(--text-color)",
          }}
        />
      </div>

      {/* Filtros de categoria */}
      {categories.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8 p-5 rounded-xl shadow"
        style={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            borderColor: "var(--card-color)"
          }}>
          <h3 className="font-semibold mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 accent-[#1E40AF]"
                />
                <span className="capitalize">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Grid de itens */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {displayedItems.map((item, index) => (
          <div key={index}>{renderItem(item)}</div>
        ))}
      </div>

      {/* Paginação */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}