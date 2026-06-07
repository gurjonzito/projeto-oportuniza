import { useState, useEffect, useMemo } from "react";
import { Check, X, Tag, Search } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";
import { adminApi, type Video } from "../../services/adminApi";

type Filter = "all" | "curated" | "not";

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editingTags, setEditingTags] = useState<Video | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    adminApi
      .listarVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  async function toggleCurated(id: string, current: boolean) {
    // Optimistic update
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isCurated: !current } : v)),
    );
    try {
      await adminApi.toggleCurated(id, !current);
    } catch {
      // Revert on error
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isCurated: current } : v)),
      );
    }
  }

  async function saveTags() {
    if (!editingTags) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setSavingTags(true);
    try {
      await adminApi.atualizarTags(editingTags.id, tags);
      setVideos((prev) =>
        prev.map((v) => (v.id === editingTags.id ? { ...v, tags } : v)),
      );
      setEditingTags(null);
    } finally {
      setSavingTags(false);
    }
  }

  function openTagsModal(v: Video) {
    setEditingTags(v);
    setTagsInput(v.tags.join(", "));
  }

  const filtered = useMemo(() => {
    let list = videos;
    if (filter === "curated") list = list.filter((v) => v.isCurated);
    if (filter === "not") list = list.filter((v) => !v.isCurated);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.titulo.toLowerCase().includes(q) ||
          v.canal?.nome?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [videos, filter, search]);

  const columns: Column<Video>[] = [
    {
      key: "thumb",
      label: "",
      render: (row) => (
        <a
          href={`https://youtube.com/watch?v=${row.youtubeVideoId}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={
              row.thumbnailUrl ??
              (row.youtubeVideoId
                ? `https://img.youtube.com/vi/${row.youtubeVideoId}/mqdefault.jpg`
                : "")
            }
            className="w-20 h-12 object-cover rounded-md hover:opacity-80 transition"
            alt=""
          />
        </a>
      ),
    },
    {
      key: "titulo",
      label: "Vídeo",
      render: (row) => (
        <div>
          <p
            className="font-medium text-sm leading-snug"
            style={{ color: "var(--text-color)" }}
          >
            {row.titulo}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-muted, #9ca3af)" }}
          >
            {row.canal?.nome}
          </p>
        </div>
      ),
    },
    {
      key: "tags",
      label: "Tags",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.tags.length > 0 ? (
            row.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
              >
                {t}
              </span>
            ))
          ) : (
            <span
              className="text-xs"
              style={{ color: "var(--text-muted, #9ca3af)" }}
            >
              sem tags
            </span>
          )}
        </div>
      ),
    },
    {
      key: "isCurated",
      label: "Curado",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCurated(row.id, row.isCurated);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
            row.isCurated
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {row.isCurated ? (
            <>
              <Check size={11} />
              Sim
            </>
          ) : (
            <>
              <X size={11} />
              Não
            </>
          )}
        </button>
      ),
    },
    {
      key: "acoes",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openTagsModal(row);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs hover:bg-gray-50 transition"
          style={{
            borderColor: "var(--border-color, #e5e7eb)",
            color: "var(--text-color)",
          }}
          title="Editar tags"
        >
          <Tag size={12} />
          Tags
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Vídeos"
        description="Gerencie vídeos da plataforma, organize categorias e aplique tags para facilitar a curadoria."
        actions={
          <div className="flex items-center gap-2">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
              style={{
                backgroundColor: "var(--card-bg, white)",
                borderColor: "var(--border-color, #e5e7eb)",
              }}
            >
              <Search
                size={13}
                style={{ color: "var(--text-muted, #9ca3af)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar vídeo..."
                className="bg-transparent outline-none w-36 text-sm"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            {/* Filter tabs */}
            <div
              className="flex items-center rounded-lg border overflow-hidden text-xs"
              style={{ borderColor: "var(--border-color, #e5e7eb)" }}
            >
              {(["all", "curated", "not"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 transition ${filter === f ? "bg-[#1E40AF] text-white" : "hover:bg-gray-50"}`}
                  style={filter !== f ? { color: "var(--text-color)" } : {}}
                >
                  {f === "all"
                    ? "Todos"
                    : f === "curated"
                      ? "Curados"
                      : "Não curados"}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="Nenhum vídeo encontrado."
      />

      {/* Tags modal */}
      <AdminModal
        title="Editar Tags"
        open={!!editingTags}
        onClose={() => setEditingTags(null)}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setEditingTags(null)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-color)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={saveTags}
              disabled={savingTags}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {savingTags && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Salvar
            </button>
          </>
        }
      >
        {editingTags && (
          <div className="flex flex-col gap-3">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-color)" }}
            >
              {editingTags.titulo}
            </p>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "var(--text-muted, #6b7280)" }}
              >
                Tags (separadas por vírgula)
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="react, frontend, javascript"
                className="input-admin"
              />
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
