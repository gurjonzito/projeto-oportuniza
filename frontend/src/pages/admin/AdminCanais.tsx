import { useState, useEffect } from "react";
import { adminApi, type Canal } from "../../services/adminApi";
import { Pencil, Trash2 } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminTable, { type Column } from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";

const emptyForm: Omit<Canal, "id"> = {
  nome: "",
  youtubeChannelId: "",
  descricao: "",
  thumbnailUrl: "",
};

export default function AdminCanais() {
  const [canais, setCanais] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Canal | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    adminApi
      .listarCanais()
      .then(setCanais)
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(canal: Canal) {
    setEditing(canal);
    setForm({
      nome: canal.nome,
      youtubeChannelId: canal.youtubeChannelId,
      descricao: canal.descricao ?? "",
      thumbnailUrl: canal.thumbnailUrl ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.nome || !form.youtubeChannelId) return;
    if (editing) {
      await adminApi.editarCanal(editing.id, form);
      setCanais((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)),
      );
    } else {
      const novo = await adminApi.criarCanal(form);
      setCanais((prev) => [...prev, novo]);
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este canal?")) return;
    await adminApi.deletarCanal(id);
    setCanais((prev) => prev.filter((c) => c.id !== id));
  }

  const columns: Column<Canal>[] = [
    {
      key: "thumbnail",
      label: "",
      render: (row) =>
        row.thumbnailUrl ? (
          <img
            src={row.thumbnailUrl}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
            {row.nome[0]}
          </div>
        ),
    },
    { key: "nome", label: "Nome" },
    { key: "youtubeChannelId", label: "Channel ID" },
    { key: "descricao", label: "Descrição" },
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
        title="Canais"
        description="Canais do YouTube presentes na plataforma."
        onAdd={openNew}
        addLabel="Novo Canal"
      />

      <AdminTable
        columns={columns}
        data={canais}
        loading={loading}
        emptyMessage="Nenhum canal encontrado."
      />

      <AdminModal
        title={editing ? "Editar Canal" : "Novo Canal"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
          <Field label="Nome do Canal *">
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Filipe Deschamps"
              className="input-admin"
            />
          </Field>
          <Field label="YouTube Channel ID *">
            <input
              value={form.youtubeChannelId}
              onChange={(e) =>
                setForm({ ...form, youtubeChannelId: e.target.value })
              }
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxxx"
              className="input-admin"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={2}
              placeholder="Breve descrição do canal..."
              className="input-admin resize-none"
            />
          </Field>
          <Field label="Thumbnail URL">
            <input
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
              className="input-admin"
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
