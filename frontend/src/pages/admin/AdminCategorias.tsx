import { useState, useEffect } from "react";
import { adminApi, type Categoria } from "../../services/adminApi";
import { Pencil, Trash2 } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";

const emptyForm = { nome: "", descricao: "" };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    adminApi
      .listarCategorias()
      .then(setCategorias)
      .finally(() => setLoading(false));
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

  const columns: Column<Categoria>[] = [
    {
      key: "nome",
      label: "Nome",
      render: (row) => (
        <span className="font-semibold" style={{ color: "var(--text-color)" }}>
          {row.nome}
        </span>
      ),
    },
    { key: "descricao", label: "Descrição" },
    {
      key: "criadaEm",
      label: "Criada em",
      render: (row) => (
        <span
          className="text-xs"
          style={{ color: "var(--text-muted, #9ca3af)" }}
        >
          {new Date(row.criadaEm).toLocaleDateString("pt-BR")}
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
        title="Categorias"
        description="Categorias que organizam as trilhas na plataforma."
        onAdd={openNew}
        addLabel="Nova Categoria"
      />

      <AdminTable columns={columns} data={categorias} />

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
