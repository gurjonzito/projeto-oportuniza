import { useState, useEffect } from "react";
import { adminApi, type Trilha, type Categoria } from "../../services/adminApi";
import { GripVertical, Pencil, Trash2, Download } from "lucide-react";
import AdminModal from "../../components/admin/AdminModal";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

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

// ← FORA do AdminTrilhas — referência estável, sem remontar a cada render
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

function SortableRow({
  trilha,
  openEdit,
  handleDelete,
}: {
  trilha: Trilha;
  openEdit: (t: Trilha) => void;
  handleDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({ id: trilha.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        borderBottom: "1px solid var(--border-color, #f3f4f6)",
      }}
    >
      <td className="px-4 py-3" style={{ color: "var(--text-color)" }}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          style={{ color: "var(--text-muted, #9ca3af)" }}
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3">{trilha.titulo}</td>
      <td className="px-4 py-3">{trilha.categoriaNome}</td>
      <td className="px-4 py-3">{trilha.nivel || "—"}</td>
      <td className="px-4 py-3">{trilha.destaque ? "⭐" : "—"}</td>
      <td className="px-4 py-3">
        {trilha.ativa ? (
          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
            Ativa
          </span>
        ) : (
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs">
            Inativa
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(trilha)}
            className="p-1.5 rounded-lg transition"
            style={{ color: "#3b82f6" }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(trilha.id)}
            className="p-1.5 rounded-lg transition"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminTrilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importCategoriaId, setImportCategoriaId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Trilha | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [ordemAlterada, setOrdemAlterada] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.listarTrilhas(), adminApi.listarCategorias()]).then(
      ([t, c]) => {
        setTrilhas(t);
        setCategorias(c);
      },
    );
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = trilhas.findIndex((t) => t.id === active.id);
    const newIndex = trilhas.findIndex((t) => t.id === over.id);
    setTrilhas(arrayMove(trilhas, oldIndex, newIndex));
    setOrdemAlterada(true);
  }

  async function handleSalvarOrdem() {
    try {
      await adminApi.reordenarTrilhas(
        trilhas.map((trilha, index) => ({ id: trilha.id, ordem: index })),
      );
      setOrdemAlterada(false);
      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar ordem.");
    }
  }

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
                categoriaNome:
                  categorias.find((c) => c.id === editForm.categoriaId)?.nome ??
                  t.categoriaNome,
              }
            : t,
        ),
      );
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta trilha?")) return;
    await adminApi.deletarTrilha(id);
    setTrilhas((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <AdminPageHeader
        title="Trilhas"
        description="Trilhas de aprendizado organizadas por categoria."
        actions={
          <div className="flex gap-2">
            {ordemAlterada && (
              <button
                onClick={handleSalvarOrdem}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Salvar Ordem
              </button>
            )}
            <button
              onClick={openImport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 transition"
            >
              <Download size={15} />
              Importar Playlist
            </button>
          </div>
        }
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg, white)",
            borderColor: "var(--border-color, #e5e7eb)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--table-head-bg, #f9fafb)",
                  borderBottom: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted, #9ca3af)" }}></th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Nível</th>
                <th className="px-4 py-3 text-left">Destaque</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={trilhas.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {trilhas.map((trilha) => (
                  <SortableRow
                    key={trilha.id}
                    trilha={trilha}
                    openEdit={openEdit}
                    handleDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

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
              {importing && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
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
              {saving && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
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
              {niveis.map((n) => (
                <option key={n}>{n}</option>
              ))}
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
              <input
                type="checkbox"
                checked={editForm.ativa}
                onChange={(e) => setEditForm({ ...editForm, ativa: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Trilha ativa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.destaque}
                onChange={(e) => setEditForm({ ...editForm, destaque: e.target.checked })}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Destaque</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isCurated}
                onChange={(e) => setEditForm({ ...editForm, isCurated: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>Curada</span>
            </label>
          </div>
        </div>
      </AdminModal>
    </>
  );
}