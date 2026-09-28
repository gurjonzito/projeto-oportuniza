import { useState, useEffect } from "react";
import { adminApi, type Categoria } from "../../services/adminApi";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminModal from "../../components/admin/AdminModal";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const emptyForm = { nome: "", descricao: "" };

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

function SortableCategoriaRow({
  categoria,
  openEdit,
  handleDelete,
}: {
  categoria: Categoria;
  openEdit: (c: Categoria) => void;
  handleDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoria.id });

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
      <td className="px-4 py-3">
        <span className="font-semibold" style={{ color: "var(--text-color)" }}>
          {categoria.nome}
        </span>
      </td>
      <td className="px-4 py-3">{categoria.descricao}</td>
      <td
        className="px-4 py-3 text-xs"
        style={{ color: "var(--text-muted, #9ca3af)" }}
      >
        {new Date(categoria.criadaEm).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(categoria)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(categoria.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ordemAlterada, setOrdemAlterada] = useState(false);

  useEffect(() => {
    adminApi.listarCategorias().then(setCategorias);
  }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Categoria) {
    setEditing(c);
    setForm({ nome: c.nome, descricao: c.descricao ?? "" });
    setModalOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categorias.findIndex((c) => c.id === active.id);
    const newIndex = categorias.findIndex((c) => c.id === over.id);
    setCategorias(arrayMove(categorias, oldIndex, newIndex));
    setOrdemAlterada(true);
  }

  async function handleSalvarOrdem() {
    try {
      await adminApi.reordenarCategorias(
        categorias.map((c, i) => ({ id: c.id, ordem: i })),
      );
      setOrdemAlterada(false);
      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar ordem.");
    }
  }

  async function handleSave() {
    if (!form.nome) return;
    try {
      if (editing) {
        await adminApi.editarCategoria(editing.id, form);
        setCategorias((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)),
        );
      } else {
        const nova = await adminApi.criarCategoria(form);
        setCategorias((prev) => [...prev, nova]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao salvar:", err?.response?.data);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta categoria?")) return;
    try {
      await adminApi.deletarCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.erro ?? "Erro ao remover categoria.");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categorias"
        description="Arraste para definir a ordem em que aparecem no site. As categorias no topo aparecem primeiro."
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
              onClick={openNew}
              className="px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 transition text-sm font-semibold"
            >
              Nova Categoria
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
                <th style={{ width: 40 }} />
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Criada em</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={categorias.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categorias.map((c) => (
                  <SortableCategoriaRow
                    key={c.id}
                    categoria={c}
                    openEdit={openEdit}
                    handleDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

      <AdminModal
        title={editing ? "Editar Categoria" : "Nova Categoria"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="sm"
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
        <div className="flex flex-col gap-4">
          <Field label="Nome *">
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Tecnologia"
              className="input-admin"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={3}
              placeholder="Breve descrição da categoria..."
              className="input-admin resize-none"
            />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}