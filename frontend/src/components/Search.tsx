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
}: SearchProps<T>) {
  const [search, setSearch] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "todos",
  ]);

  const [page, setPage] = useState(1);

  /*
    NORMALIZA TEXTO
  */

  const normalizeText = (text: string) =>
    String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  /*
    TOGGLE CATEGORIA
  */

  const toggleCategory = async (category: string) => {
    let updatedCategories: string[] = [];

    /*
        TODOS
      */

    if (category === "todos") {
      updatedCategories = ["todos"];
    } else {
      const withoutTodos = selectedCategories.filter((c) => c !== "todos");

      updatedCategories = selectedCategories.includes(category)
        ? withoutTodos.filter((c) => c !== category)
        : [...withoutTodos, category];
    }

    setSelectedCategories(updatedCategories);

    setPage(1);

    /*
        BACKEND SEARCH
      */

    if (onSearch) {
      await onSearch(search, updatedCategories);
    }
  };

  /*
    FILTRO
  */

  const filteredItems = (items || []).filter((item) => {
    if (filterFn) {
      try {
        return filterFn(item, search, selectedCategories);
      } catch (error) {
        console.error("Erro no filterFn:", error);

        return true;
      }
    }

    const title = String((item as any)?.title || "");

    const category = String((item as any)?.category || "");

    const matchSearch = normalizeText(title).includes(normalizeText(search));

    if (!category) {
      return matchSearch;
    }

    const matchFilter =
      selectedCategories.length === 0 ||
      selectedCategories.includes("todos") ||
      selectedCategories.includes(category);

    return matchSearch && matchFilter;
  });

  /*
    PAGINAÇÃO
  */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage),
  );

  /*
    RESETA PÁGINA
  */

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const displayedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div
      className="
        min-h-screen
        px-6
        py-10
      "
      style={{
        backgroundColor: "var(--bg-color)",
      }}
    >
      {/* INPUT */}

      <div
        className="
        max-w-2xl
        mx-auto
        mb-6
        relative
      "
      >
        <SearchIcon
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={async (e) => {
            const value = e.target.value;

            setSearch(value);

            setPage(1);

            /*
              BACKEND SEARCH
            */

            if (onSearch) {
              await onSearch(value, selectedCategories);
            }
          }}
          className="
            w-full
            pl-10
            p-3
            rounded-full
            border
            focus:outline-none
            focus:ring-2
            focus:ring-blue-400
            transition-colors
          "
          style={{
            backgroundColor: "var(--card-color)",

            color: "var(--text-color)",

            borderColor: "var(--text-color)",
          }}
        />
      </div>

      {/* CATEGORIAS */}

      {categories.length > 0 && (
        <div
          className="
            max-w-4xl
            mx-auto
            mb-8
            p-5
            rounded-xl
            shadow
          "
          style={{
            backgroundColor: "var(--card-color)",

            color: "var(--text-color)",
          }}
        >
          <h3
            className="
            font-semibold
            mb-3
          "
          >
            Categorias
          </h3>

          <div
            className="
            flex
            flex-wrap
            gap-4
          "
          >
            {categories.map((cat) => (
              <label
                key={cat}
                className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                "
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="
                    w-4
                    h-4
                    accent-[#1E40AF]
                  "
                />

                <span className="capitalize">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div
          className="
          text-center
          py-10
        "
        >
          <p
            style={{
              color: "var(--text-color)",
            }}
          >
            Carregando vídeos...
          </p>
        </div>
      )}

      {/* SEM RESULTADOS */}

      {!loading && filteredItems.length === 0 && (
        <div
          className="
          text-center
          py-10
        "
        >
          <p
            style={{
              color: "var(--text-color)",
            }}
          >
            Nenhum vídeo encontrado.
          </p>
        </div>
      )}

      {/* GRID */}

      {!loading && filteredItems.length > 0 && (
        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            max-w-6xl
            mx-auto
          "
        >
          {displayedItems.map((item, index) => (
            <div key={index}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {/* PAGINAÇÃO */}

      {!loading && filteredItems.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
