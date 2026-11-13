import { useEffect, useState } from "react";
import {
  adminApi,
  type Video,
  type VideoCandidato,
} from "../../services/adminApi";
import {
  Search,
  Check,
  Loader2,
  ExternalLink,
  Star,
  StarOff,
  Tag,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminModal from "../../components/admin/AdminModal";

type Aba = "descobrir" | "curados" | "todos";

function formatarDuracao(seg?: number) {
  if (!seg) return "";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AdminVideos() {
  const [aba, setAba] = useState<Aba>("descobrir");

  // ─── Descoberta ─────────────────────────────────────────────────────
  const [termo, setTermo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [candidatos, setCandidatos] = useState<VideoCandidato[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [curandoId, setCurandoId] = useState<string | null>(null);

  // ─── Listagem ───────────────────────────────────────────────────────
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // ─── Modal de tags ──────────────────────────────────────────────────
  const [editingTags, setEditingTags] = useState<Video | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);

  // ─── Carrega a lista quando muda a aba ──────────────────────────────
  useEffect(() => {
    if (aba === "descobrir") return;

    async function carregar() {
      setLoadingVideos(true);
      try {
        const lista = await adminApi.listarVideos();
        setVideos(lista);
      } catch (err) {
        console.error("Erro ao listar vídeos:", err);
      } finally {
        setLoadingVideos(false);
      }
    }

    carregar();
  }, [aba]);

  // ─── Handlers ───────────────────────────────────────────────────────

  async function handleBuscar() {
    if (!termo.trim()) return;

    setBuscando(true);
    setBuscou(true);
    try {
      const r = await adminApi.descobrirVideos(termo.trim());
      setCandidatos(r);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.erro ?? "Erro ao buscar vídeos.");
      setCandidatos([]);
    } finally {
      setBuscando(false);
    }
  }

  async function handleCurar(video: VideoCandidato) {
    setCurandoId(video.youtubeVideoId);
    try {
      await adminApi.curarVideo(video);
      setCandidatos((prev) =>
        prev.map((v) =>
          v.youtubeVideoId === video.youtubeVideoId
            ? { ...v, curado: true, jaExiste: true }
            : v,
        ),
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.erro ?? "Erro ao curar vídeo.");
    } finally {
      setCurandoId(null);
    }
  }

  async function handleToggleCurado(video: Video) {
    const novo = !video.isCurated;

    // Optimistic update
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, isCurated: novo } : v)),
    );

    try {
      await adminApi.toggleCurated(video.id, novo);
    } catch (err) {
      console.error(err);
      // Reverte em caso de erro
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, isCurated: video.isCurated } : v,
        ),
      );
      alert("Erro ao atualizar curadoria.");
    }
  }

  function openTagsModal(video: Video) {
    setEditingTags(video);
    setTagsInput(video.tags.join(", "));
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
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar tags.");
    } finally {
      setSavingTags(false);
    }
  }

  // ─── Filtros derivados ──────────────────────────────────────────────
  const videosFiltrados = videos.filter((v) => {
    if (aba === "curados") return v.isCurated;
    return true; // "todos"
  });

  return (
    <div>
      <AdminPageHeader
        title="Vídeos"
        description="Descubra vídeos dos canais cadastrados e escolha quais merecem ser curados."
      />

      {/* Abas */}
      <div
        className="flex gap-1 mb-6 border-b"
        style={{ borderColor: "var(--border-color, #e5e7eb)" }}
      >
        {[
          { id: "descobrir" as Aba, label: "Descobrir" },
          { id: "curados" as Aba, label: "Curados" },
          { id: "todos" as Aba, label: "Todos" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
              aba === t.id
                ? "border-[#1E40AF] text-[#1E40AF]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Aba Descobrir ──────────────────────────────────────────── */}
      {aba === "descobrir" && (
        <>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted, #9ca3af)" }}
              />
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBuscar();
                }}
                placeholder="Ex: currículo, entrevista de emprego, educação financeira..."
                className="input-admin w-full pl-10 pr-4 py-2.5 rounded-xl border"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={buscando || !termo.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buscando ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {!buscou && (
            <div
              className="rounded-xl border py-16 text-center text-sm"
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-muted, #9ca3af)",
              }}
            >
              Digite um tema acima para ver vídeos recomendados dos canais
              cadastrados.
            </div>
          )}

          {buscou && !buscando && candidatos.length === 0 && (
            <div
              className="rounded-xl border py-16 text-center text-sm"
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-muted, #9ca3af)",
              }}
            >
              Nenhum vídeo encontrado para "{termo}".
            </div>
          )}

          {buscou && candidatos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidatos.map((v) => (
                <div
                  key={v.youtubeVideoId}
                  className="rounded-xl border overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: "var(--card-bg, white)",
                    borderColor: v.curado
                      ? "#10b981"
                      : "var(--border-color, #e5e7eb)",
                  }}
                >
                  <img
                    src={v.thumbnail}
                    alt={v.titulo}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <p
                      className="text-sm font-bold line-clamp-2"
                      style={{ color: "var(--text-color)" }}
                    >
                      {v.titulo}
                    </p>

                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    >
                      {v.canal}
                      {v.duracaoSegundos
                        ? ` · ${formatarDuracao(v.duracaoSegundos)}`
                        : ""}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-2">
                      {v.curado ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <Check size={14} />
                          Curado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCurar(v)}
                          disabled={curandoId === v.youtubeVideoId}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold hover:bg-blue-700 transition enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {curandoId === v.youtubeVideoId ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          Curar este vídeo
                        </button>
                      )}

                      <a
                        href={`https://www.youtube.com/watch?v=${v.youtubeVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                        title="Abrir no YouTube"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Abas Curados / Todos ───────────────────────────────────── */}
      {aba !== "descobrir" && (
        <>
          {loadingVideos && (
            <div className="flex items-center justify-center py-16 gap-2 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Carregando vídeos...
            </div>
          )}

          {!loadingVideos && videosFiltrados.length === 0 && (
            <div
              className="rounded-xl border py-16 text-center text-sm"
              style={{
                borderColor: "var(--border-color, #e5e7eb)",
                color: "var(--text-muted, #9ca3af)",
              }}
            >
              {aba === "curados"
                ? "Nenhum vídeo curado ainda. Use a aba Descobrir para adicionar."
                : "Nenhum vídeo cadastrado ainda."}
            </div>
          )}

          {!loadingVideos && videosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videosFiltrados.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: "var(--card-bg, white)",
                    borderColor: v.isCurated
                      ? "#10b981"
                      : "var(--border-color, #e5e7eb)",
                  }}
                >
                  <img
                    src={
                      v.thumbnailUrl ??
                      `https://img.youtube.com/vi/${v.youtubeVideoId}/mqdefault.jpg`
                    }
                    alt={v.titulo}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <p
                      className="text-sm font-bold line-clamp-2"
                      style={{ color: "var(--text-color)" }}
                    >
                      {v.titulo}
                    </p>

                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted, #9ca3af)" }}
                    >
                      {v.canal?.nome ?? "—"}
                    </p>

                    {v.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {v.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleToggleCurado(v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          v.isCurated
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {v.isCurated ? (
                          <>
                            <StarOff size={12} />
                            Descurar
                          </>
                        ) : (
                          <>
                            <Star size={12} />
                            Curar
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openTagsModal(v)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                        title="Editar tags"
                      >
                        <Tag size={14} />
                      </button>

                      <a
                        href={`https://www.youtube.com/watch?v=${v.youtubeVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                        title="Abrir no YouTube"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Modal de tags ─────────────────────────────────────────── */}
      <AdminModal
        title="Editar Tags"
        open={!!editingTags}
        onClose={() => setEditingTags(null)}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setEditingTags(null)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#1E40AF] text-white font-semibold hover:bg-blue-700 transition enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
              className="text-sm font-medium line-clamp-2"
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