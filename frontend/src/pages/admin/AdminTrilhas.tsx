import { useState, useEffect } from "react";
import { adminApi, type Trilha, type Categoria } from "../../services/adminApi";
import { Pencil, Trash2, Star } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";

const niveis = ["Iniciante", "Intermediário", "Avançado", "Todos os níveis"];

const emptyForm = {
  titulo: "",
  slug: "",
  categoriaNome: "",
  nivel: "",
  destaque: false,
  ativa: true,
  isCurated: true,
  youtubePlaylistId: "",
  descricao: "",
};

export default function AdminTrilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trilha | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([adminApi.listarTrilhas(), adminApi.listarCategorias()])
      .then(([t, c]) => {
        setTrilhas(t);
        setCategorias(c);
      })
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t: Trilha) {
    setEditing(t);
    setForm({
      titulo: t.titulo,
      slug: t.slug,
      categoriaNome: t.categoriaNome,
      nivel: t.nivel ?? "",
      destaque: t.destaque,
      ativa: t.ativa,
      isCurated: t.isCurated,
      youtubePlaylistId: t.youtubePlaylistId ?? "",
      descricao: "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.titulo || !form.slug) return;
    const parsed = {
      ...form,
      nivel: form.nivel || undefined,
      youtubePlaylistId: form.youtubePlaylistId || undefined,
    };
    if (editing) {
      await adminApi.editarTrilha(editing.id, parsed);
      setTrilhas((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...editing, ...parsed } : t)),
      );
    } else {
      const nova = await adminApi.criarTrilha(parsed as Omit<Trilha, "id">);
      setTrilhas((prev) => [...prev, nova]);
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta trilha?")) return;
    await adminApi.deletarTrilha(id);
    setTrilhas((prev) => prev.filter((t) => t.id !== id));
  }

  const columns: Column<Trilha>[] = [
    { key: "titulo", label: "Título" },
    { key: "categoriaNome", label: "Categoria" },
    { key: "nivel", label: "Nível" },
    {
      key: "destaque",
      label: "Destaque",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${row.destaque ? "text-yellow-600" : "text-gray-400"}`}
        >
          <Star size={12} fill={row.destaque ? "currentColor" : "none"} />
          {row.destaque ? "Sim" : "Não"}
        </span>
      ),
    },
    {
      key: "ativa",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.ativa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {row.ativa ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "isCurated",
      label: "Curada",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isCurated ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
        >
          {row.isCurated ? "Sim" : "Não"}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Trilhas"
        description="Trilhas de aprendizado organizadas por categoria."
        onAdd={openNew}
        addLabel="Nova Trilha"
      />

      <AdminTable columns={columns} data={trilhas} />

      <AdminModal
        title={editing ? "Editar Trilha" : "Nova Trilha"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-color)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition"
            >
              Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Título *">
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Desenvolvimento Web do Zero"
                className="input-admin"
              />
            </Field>
          </div>
          <Field label="Slug *">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="dev-web-zero"
              className="input-admin"
            />
          </Field>
          <Field label="Categoria">
            <select
              value={form.categoriaNome}
              onChange={(e) =>
                setForm({ ...form, categoriaNome: e.target.value })
              }
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {categorias.map((c) => (
                <option key={c.id}>{c.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Nível">
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {niveis.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="YouTube Playlist ID">
            <input
              value={form.youtubePlaylistId}
              onChange={(e) =>
                setForm({ ...form, youtubePlaylistId: e.target.value })
              }
              placeholder="PLxxxxxxxxxxxxxxxx"
              className="input-admin"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Descrição">
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                rows={2}
                className="input-admin resize-none"
                placeholder="Breve descrição da trilha..."
              />
            </Field>
          </div>
          <div className="col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativa}
                onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>
                Trilha ativa
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destaque}
                onChange={(e) =>
                  setForm({ ...form, destaque: e.target.checked })
                }
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>
                Destaque
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isCurated}
                onChange={(e) =>
                  setForm({ ...form, isCurated: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>
                Curada
              </span>
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold"
        style={{ color: "var(--text-muted, #6b7280)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
