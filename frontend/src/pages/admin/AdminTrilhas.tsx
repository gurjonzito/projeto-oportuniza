import { useState, useEffect } from "react";
import { adminApi, type Trilha, type Categoria } from "../../services/adminApi";
import { Pencil, Trash2, Star, Download } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";

const niveis = ["Iniciante", "Intermediário", "Avançado", "Todos os níveis"];

const emptyEditForm = {
  titulo: "",
  slug: "",
  categoriaId: "",
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

  // Modal de importação
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importCategoriaId, setImportCategoriaId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Trilha | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.listarTrilhas(), adminApi.listarCategorias()])
      .then(([t, c]) => { setTrilhas(t); setCategorias(c); })
      .finally(() => setLoading(false));
  }, []);

  // ─── IMPORTAR ──────────────────────────────────────────────────────────────

  function openImport() {
    setImportUrl("");
    setImportCategoriaId("");
    setImportError("");
    setImportOpen(true);
  }

  async function handleImport() {
    if (!importUrl || !importCategoriaId) {
      setImportError("Preencha a URL e a categoria.");
      return;
    }
    setImporting(true);
    setImportError("");
    try {
      const trilha = await adminApi.importarPlaylist(importUrl, importCategoriaId);
      setTrilhas((prev) => [trilha, ...prev]);
      setImportOpen(false);
    } catch (err: any) {
      setImportError(err?.response?.data?.error ?? "Erro ao importar playlist.");
    } finally {
      setImporting(false);
    }
  }

  // ─── EDITAR ────────────────────────────────────────────────────────────────

  function openEdit(t: Trilha) {
    setEditing(t);
    setEditForm({
      titulo: t.titulo,
      slug: t.slug,
      categoriaId: t.categoriaId ?? "",
      nivel: t.nivel ?? "",
      destaque: t.destaque,
      ativa: t.ativa,
      isCurated: t.isCurated,
      youtubePlaylistId: t.youtubePlaylistId ?? "",
      descricao: t.descricao ?? "",
    });
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await adminApi.editarTrilha(editing.id, editForm);
      setTrilhas((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? {
                ...t,
                ...editForm,
                categoriaNome: categorias.find((c) => c.id === editForm.categoriaId)?.nome ?? t.categoriaNome,
              }
            : t,
        ),
      );
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  }

  // ─── DELETAR ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm("Remover esta trilha?")) return;
    await adminApi.deletarTrilha(id);
    setTrilhas((prev) => prev.filter((t) => t.id !== id));
  }

  // ─── COLUNAS ───────────────────────────────────────────────────────────────

  const columns: Column<Trilha>[] = [
    { key: "titulo", label: "Título" },
    { key: "categoriaNome", label: "Categoria" },
    { key: "nivel", label: "Nível" },
    {
      key: "destaque",
      label: "Destaque",
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.destaque ? "text-yellow-600" : "text-gray-400"}`}>
          <Star size={12} fill={row.destaque ? "currentColor" : "none"} />
          {row.destaque ? "Sim" : "Não"}
        </span>
      ),
    },
    {
      key: "ativa",
      label: "Status",
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.ativa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {row.ativa ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "isCurated",
      label: "Curada",
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isCurated ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
          {row.isCurated ? "Sim" : "Não"}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition">
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
        actions={
          <button
            onClick={openImport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Download size={15} />
            Importar Playlist
          </button>
        }
      />

      <AdminTable columns={columns} data={trilhas} loading={loading} emptyMessage="Nenhuma trilha encontrada." />

      {/* Modal de importação */}
      <AdminModal
        title="Importar Playlist do YouTube"
        open={importOpen}
        onClose={() => setImportOpen(false)}
        size="md"
        footer={
          <>
            <button
              onClick={() => setImportOpen(false)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
              style={{ borderColor: "var(--border-color, #e5e7eb)", color: "var(--text-color)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {importing && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {importing ? "Importando..." : "Importar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="URL da Playlist *">
            <input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=PL..."
              className="input-admin"
            />
          </Field>
          <Field label="Categoria *">
            <select
              value={importCategoriaId}
              onChange={(e) => setImportCategoriaId(e.target.value)}
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </Field>
          {importError && (
            <p className="text-xs text-red-500 font-medium">{importError}</p>
          )}
        </div>
      </AdminModal>

      {/* Modal de edição */}
      <AdminModal
        title="Editar Trilha"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
              style={{ borderColor: "var(--border-color, #e5e7eb)", color: "var(--text-color)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Título *">
              <input
                value={editForm.titulo}
                onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                className="input-admin"
              />
            </Field>
          </div>
          <Field label="Slug *">
            <input
              value={editForm.slug}
              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
              className="input-admin"
            />
          </Field>
          <Field label="Categoria">
            <select
              value={editForm.categoriaId}
              onChange={(e) => setEditForm({ ...editForm, categoriaId: e.target.value })}
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Nível">
            <select
              value={editForm.nivel}
              onChange={(e) => setEditForm({ ...editForm, nivel: e.target.value })}
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {niveis.map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="YouTube Playlist ID">
            <input
              value={editForm.youtubePlaylistId}
              onChange={(e) => setEditForm({ ...editForm, youtubePlaylistId: e.target.value })}
              className="input-admin"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Descrição">
              <textarea
                value={editForm.descricao}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                rows={2}
                className="input-admin resize-none"
              />
            </Field>
          </div>
          <div className="col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.ativa} onChange={(e) => setEditForm({ ...editForm, ativa: e.target.checked })} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Trilha ativa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.destaque} onChange={(e) => setEditForm({ ...editForm, destaque: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Destaque</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.isCurated} onChange={(e) => setEditForm({ ...editForm, isCurated: e.target.checked })} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Curada</span>
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--text-muted, #6b7280)" }}>{label}</label>
      {children}
    </div>
  );
}