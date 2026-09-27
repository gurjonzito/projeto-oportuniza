import { useState, useEffect, useMemo } from "react";
import { adminApi, type Trilha, type Categoria } from "../../services/adminApi";
import { GripVertical, Pencil, Trash2, Download, RefreshCw } from "lucide-react";
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

const SEM_CATEGORIA = "__sem_categoria__";

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

function SortableTrilhaRow({
  trilha,
  index,
  openEdit,
  handleDelete,
  handleSync,
  syncing,
}: {
  trilha: Trilha;
  index: number;
  openEdit: (t: Trilha) => void;
  handleDelete: (id: string) => void;
  handleSync: (t: Trilha) => void;
  syncing: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: trilha.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderBottom: "1px solid var(--border-color, #f3f4f6)",
    backgroundColor: isDragging ? "var(--bg-subtle, #f9fafb)" : "transparent",
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-4 py-3" style={{ width: 40 }}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          style={{ color: "var(--text-muted, #9ca3af)" }}
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3" style={{ width: 40 }}>
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
        >
          {index + 1}
        </span>
      </td>
      <td className="px-4 py-3">{trilha.titulo}</td>
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
          {trilha.youtubePlaylistId && (
            <button
              onClick={() => handleSync(trilha)}
              disabled={syncing}
              title="Sincronizar com o YouTube"
              className="p-1.5 rounded-lg transition disabled:opacity-40"
              style={{ color: "#8b5cf6" }}
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            </button>
          )}
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

  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.listarTrilhas(), adminApi.listarCategorias()]).then(
      ([t, c]) => {
        setTrilhas(t);
        setCategorias(c);
      },
    );
  }, []);

  const grupos = useMemo(() => {
    const mapa = new Map<
      string,
      { categoria: Categoria | null; trilhas: Trilha[] }
    >();

    for (const c of categorias) {
      mapa.set(c.id, { categoria: c, trilhas: [] });
    }

    const semCat: Trilha[] = [];

    for (const t of trilhas) {
      const key =
        t.categoriaId && mapa.has(t.categoriaId) ? t.categoriaId : SEM_CATEGORIA;
      if (key === SEM_CATEGORIA) {
        semCat.push(t);
      } else {
        mapa.get(key)!.trilhas.push(t);
      }
    }

    const result = Array.from(mapa.values()).filter((g) => g.trilhas.length > 0);

    if (semCat.length > 0) {
      result.push({ categoria: null, trilhas: semCat });
    }

    return result;
  }, [trilhas, categorias]);

  function handleDragEndGrupo(grupoKey: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setTrilhas((prev) => {
        const dentroDoGrupo = prev.filter(
          (t) => (t.categoriaId ?? SEM_CATEGORIA) === grupoKey,
        );
        const foraDoGrupo = prev.filter(
          (t) => (t.categoriaId ?? SEM_CATEGORIA) !== grupoKey,
        );

        const oldIndex = dentroDoGrupo.findIndex((t) => t.id === active.id);
        const newIndex = dentroDoGrupo.findIndex((t) => t.id === over.id);
        const reordenadas = arrayMove(dentroDoGrupo, oldIndex, newIndex);

        return [...foraDoGrupo, ...reordenadas];
      });

      setOrdemAlterada(true);
    };
  }

  async function handleSalvarOrdem() {
    try {
      const flat: Trilha[] = [];
      for (const g of grupos) {
        flat.push(...g.trilhas);
      }

      await adminApi.reordenarTrilhas(
        flat.map((t, i) => ({ id: t.id, ordem: i })),
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
      const trilha = await adminApi.importarPlaylist(
        importUrl,
        importCategoriaId,
      );
      setTrilhas((prev) => [trilha, ...prev]);
      setImportOpen(false);
    } catch (err: any) {
      setImportError(err?.response?.data?.error ?? "Erro ao importar playlist.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSync(trilha: Trilha) {
    if (!trilha.youtubePlaylistId) return;

    setSyncingId(trilha.id);
    try {
      const resultado = await adminApi.sincronizarTrilha(trilha.id);

      const [t, c] = await Promise.all([
        adminApi.listarTrilhas(),
        adminApi.listarCategorias(),
      ]);
      setTrilhas(t);
      setCategorias(c);

      const partes: string[] = [];
      if (resultado.adicionados) partes.push(`${resultado.adicionados} adicionado(s)`);
      if (resultado.removidos) partes.push(`${resultado.removidos} removido(s)`);
      if (resultado.atualizados) partes.push(`${resultado.atualizados} atualizado(s)`);

      alert(
        partes.length > 0
          ? `Sincronizado! ${partes.join(", ")}.`
          : "Nada mudou — já está em sincronia.",
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.erro ?? "Erro ao sincronizar.");
    } finally {
      setSyncingId(null);
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
        description="Arraste dentro de cada categoria para definir a ordem em que aparecem no site. Trilhas no topo aparecem primeiro."
        actions={
          <div className="flex gap-2">
            {ordemAlterada && (
              <button
                onClick={handleSalvarOrdem}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold"
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

      <div className="flex flex-col gap-6">
        {grupos.map((grupo) => {
          const grupoKey = grupo.categoria?.id ?? SEM_CATEGORIA;
          const nomeGrupo = grupo.categoria?.nome ?? "Sem categoria";

          return (
            <div
              key={grupoKey}
              className="rounded-xl border overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg, white)",
                borderColor: "var(--border-color, #e5e7eb)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  backgroundColor: "var(--table-head-bg, #f9fafb)",
                  borderBottom: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--text-color)" }}
                  >
                    {nomeGrupo}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(99,102,241,0.12)",
                      color: "#818cf8",
                    }}
                  >
                    {grupo.trilhas.length} trilha
                    {grupo.trilhas.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted, #9ca3af)" }}
                >
                  Ordem sequencial de exibição
                </span>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndGrupo(grupoKey)}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-color, #f3f4f6)",
                      }}
                    >
                      <th style={{ width: 40 }} />
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)", width: 40 }}
                      >
                        #
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Título
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Nível
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Destaque
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Status
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext
                      items={grupo.trilhas.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {grupo.trilhas.map((trilha, idx) => (
                        <SortableTrilhaRow
                          key={trilha.id}
                          trilha={trilha}
                          index={idx}
                          openEdit={openEdit}
                          handleDelete={handleDelete}
                          handleSync={handleSync}
                          syncing={syncingId === trilha.id}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
            </div>
          );
        })}

        {grupos.length === 0 && (
          <div
            className="rounded-xl border py-16 text-center text-sm"
            style={{
              borderColor: "var(--border-color, #e5e7eb)",
              color: "var(--text-muted, #9ca3af)",
            }}
          >
            Nenhuma trilha cadastrada ainda.
          </div>
        )}
      </div>

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
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-color)",
              }}
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
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
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
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-color)",
              }}
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
                onChange={(e) =>
                  setEditForm({ ...editForm, titulo: e.target.value })
                }
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
              onChange={(e) =>
                setEditForm({ ...editForm, categoriaId: e.target.value })
              }
              className="input-admin"
            >
              <option value="">Selecionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nível">
            <select
              value={editForm.nivel}
              onChange={(e) =>
                setEditForm({ ...editForm, nivel: e.target.value })
              }
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
              onChange={(e) =>
                setEditForm({ ...editForm, youtubePlaylistId: e.target.value })
              }
              className="input-admin"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Descrição">
              <textarea
                value={editForm.descricao}
                onChange={(e) =>
                  setEditForm({ ...editForm, descricao: e.target.value })
                }
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
                onChange={(e) =>
                  setEditForm({ ...editForm, ativa: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm" style={{ color: "var(--text-color)" }}>
                Trilha ativa
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.destaque}
                onChange={(e) =>
                  setEditForm({ ...editForm, destaque: e.target.checked })
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
                checked={editForm.isCurated}
                onChange={(e) =>
                  setEditForm({ ...editForm, isCurated: e.target.checked })
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
    </>
  );
}