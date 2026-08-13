import { useEffect, useState } from "react";
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import { adminApi, type Recurso } from "../../services/adminApi";
import AdminModal from "../../components/admin/AdminModal";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

const categoriasRecursos = [
  "Currículo",
  "Emprego",
  "Cursos e aprendizado",
  "Tecnologia",
  "Produtividade",
  "Empreendedorismo",
  "Outros",
];

const emptyForm = {
  nome: "",
  descricao: "",
  url: "",
  categoria: "",
  imagemUrl: "",
  ativo: true,
};

export default function AdminRecursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recurso | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRecursos();
  }, []);

  async function carregarRecursos() {
    try {
      setLoading(true);

      const data = await adminApi.listarRecursos();

      setRecursos(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar recursos.");
    } finally {
      setLoading(false);
    }
  }

  // ─── NOVO / EDITAR ─────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(recurso: Recurso) {
    setEditing(recurso);

    setForm({
      nome: recurso.nome,
      descricao: recurso.descricao,
      url: recurso.url,
      categoria: recurso.categoria,
      imagemUrl: recurso.imagemUrl ?? "",
      ativo: recurso.ativo,
    });

    setModalOpen(true);
  }

  // ─── SALVAR ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.nome.trim()) {
      alert("Informe o nome do recurso.");
      return;
    }

    if (!form.descricao.trim()) {
      alert("Informe a descrição do recurso.");
      return;
    }

    if (!form.url.trim()) {
      alert("Informe a URL do recurso.");
      return;
    }

    if (!form.categoria) {
      alert("Selecione uma categoria.");
      return;
    }

    try {
      setSaving(true);

      if (editing) {
        const atualizado = await adminApi.editarRecurso(editing.id, form);

        setRecursos((prev) =>
          prev.map((recurso) =>
            recurso.id === editing.id ? atualizado : recurso,
          ),
        );
      } else {
        const novo = await adminApi.criarRecurso(form);

        setRecursos((prev) => [novo, ...prev]);
      }

      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar recurso.");
    } finally {
      setSaving(false);
    }
  }

  // ─── DELETAR ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm("Remover este recurso?")) return;

    try {
      await adminApi.deletarRecurso(id);

      setRecursos((prev) => prev.filter((recurso) => recurso.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao remover recurso.");
    }
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminPageHeader
        title="Recursos úteis"
        description="Ferramentas, plataformas e sites úteis para o desenvolvimento profissional."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Novo recurso
          </button>
        }
      />

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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Nome
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Categoria
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                URL
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--text-muted, #9ca3af)" }}
                >
                  Carregando recursos...
                </td>
              </tr>
            ) : recursos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--text-muted, #9ca3af)" }}
                >
                  Nenhum recurso cadastrado.
                </td>
              </tr>
            ) : (
              recursos.map((recurso) => (
                <tr
                  key={recurso.id}
                  style={{
                    borderBottom: "1px solid var(--border-color, #f3f4f6)",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {recurso.imagemUrl ? (
                        <img
                          src={recurso.imagemUrl}
                          alt={recurso.nome}
                          className="w-9 h-9 rounded-lg object-cover border"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--table-head-bg, #f3f4f6)",
                            color: "var(--text-muted, #6b7280)",
                          }}
                        >
                          {recurso.nome.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span>{recurso.nome}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">{recurso.categoria}</td>

                  <td className="px-4 py-3 max-w-xs">
                    <a
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline truncate"
                      title={recurso.url}
                    >
                      <span className="truncate">{recurso.url}</span>

                      <ExternalLink size={13} className="shrink-0" />
                    </a>
                  </td>

                  <td className="px-4 py-3">
                    {recurso.ativo ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs">
                        Inativo
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(recurso)}
                        className="p-1.5 rounded-lg transition"
                        style={{
                          color: "#3b82f6",
                        }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(recurso.id)}
                        className="p-1.5 rounded-lg transition"
                        style={{
                          color: "#ef4444",
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de criação/edição */}

      <AdminModal
        title={editing ? "Editar Recurso" : "Novo Recurso"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        footer={
          <>
            <button
              type="button"
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
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}

              {saving ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome *">
              <input
                value={form.nome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome: e.target.value,
                  })
                }
                placeholder="Ex.: Canva"
                className="input-admin"
              />
            </Field>
          </div>

          <Field label="Categoria *">
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoria: e.target.value,
                })
              }
              className="input-admin"
            >
              <option value="">Selecionar...</option>

              {categoriasRecursos.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Field>

          <Field label="URL *">
            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                setForm({
                  ...form,
                  url: e.target.value,
                })
              }
              placeholder="https://www.exemplo.com"
              className="input-admin"
            />
          </Field>

          <div className="col-span-2">
            <Field label="Descrição *">
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    descricao: e.target.value,
                  })
                }
                placeholder="Explique brevemente para que o recurso pode ser utilizado."
                rows={3}
                className="input-admin resize-none"
              />
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="URL da imagem">
              <input
                type="url"
                value={form.imagemUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    imagemUrl: e.target.value,
                  })
                }
                placeholder="https://..."
                className="input-admin"
              />

              <span
                className="text-xs mt-1"
                style={{
                  color: "var(--text-muted, #9ca3af)",
                }}
              >
                Opcional. Pode ser a URL do logo ou imagem representativa do
                recurso.
              </span>
            </Field>
          </div>

          <div className="col-span-2 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ativo: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-blue-600"
              />

              <span
                className="text-sm"
                style={{
                  color: "var(--text-color)",
                }}
              >
                Recurso ativo
              </span>
            </label>
          </div>
        </div>
      </AdminModal>
    </>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────

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
        style={{
          color: "var(--text-muted, #6b7280)",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}
