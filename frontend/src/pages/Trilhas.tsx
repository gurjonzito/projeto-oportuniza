import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

import Search from "../components/Search";
import VideoCard from "../components/VideoCard";

import type { Trilha } from "../types/trilha";

import { getTrilhas } from "../services/trilhaService";
import { getCategorias } from "../services/categoriaService";

const NIVEIS = ["todos", "iniciante", "intermediario", "avancado"];

const NIVEL_LABEL: Record<string, string> = {
  todos: "Todos os níveis",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export default function Trilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["todos"]);
  const [nivelSelecionado, setNivelSelecionado] = useState("todos");
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getTrilhas(), getCategorias()])
      .then(([trilhasData, categoriasData]) => {
        setTrilhas(trilhasData);
        setCategories(categoriasData);
      })
      .catch((error) => console.error("Erro ao carregar trilhas:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trilhasFiltradas = trilhas.filter((trilha) => {
    if (nivelSelecionado === "todos") return true;
    const normalizar = (texto: string) =>
      texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizar(trilha.nivel ?? "") === nivelSelecionado;
  });

  const dropdownNivel = (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setDropdownAberto((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition"
        style={{
          color: "var(--text-color)",
          borderColor: "rgba(128,128,128,.3)",
          backgroundColor: "var(--card-color)",
        }}
      >
        {NIVEL_LABEL[nivelSelecionado]}
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${dropdownAberto ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownAberto && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-600 shadow-lg z-10 overflow-hidden"
          style={{ backgroundColor: "var(--card-color)" }}
        >
          {NIVEIS.map((nivel) => (
            <button
              key={nivel}
              onClick={() => {
                setNivelSelecionado(nivel);
                setDropdownAberto(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-500/20
                ${nivelSelecionado === nivel ? "text-blue-400 font-semibold" : ""}`}
              style={{ color: nivelSelecionado === nivel ? undefined : "var(--text-color)" }}
            >
              {NIVEL_LABEL[nivel]}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Search
      items={trilhasFiltradas}
      loading={loading}
      placeholder="Buscar trilhas..."
      itemsPerPage={6}
      categories={categories}
      extraFilter={dropdownNivel}
      filterFn={(trilha, search, selectedCategories) => {
        const normalizar = (texto: string) =>
          texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const titulo = trilha.titulo || "";
        const categoria = trilha.categoria?.nome || "";

        const matchSearch = normalizar(titulo).includes(normalizar(search));
        const matchCategoria =
          selectedCategories.includes("todos") ||
          selectedCategories.some((cat) => normalizar(cat) === normalizar(categoria));

        return matchSearch && matchCategoria;
      }}
      renderItem={(trilha) => (
        <VideoCard
          key={trilha.id}
          title={trilha.titulo}
          thumbnail={trilha.thumbnailUrl || ""}
          description={trilha.descricao}
          videos={trilha.videos?.length || 0}
          slug={trilha.slug}
          nivel={trilha.nivel ?? undefined}
        />
      )}
    />
  );
}