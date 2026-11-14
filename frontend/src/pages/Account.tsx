import { useEffect, useRef, useState } from "react";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CircleUserRound,
  Briefcase,
  MapPin,
  Calendar,
  Phone,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

import { authClient } from "../lib/auth-client";
import api from "../services/api";

import SelectCustom from "../components/SelectCustom";

// =========================================================
// HELPERS
// =========================================================

function mascararTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function obterMensagemErroSenha(error: any) {
  const mensagem = error?.message?.toLowerCase() || "";

  if (
    mensagem.includes("current password") ||
    mensagem.includes("invalid password") ||
    mensagem.includes("incorrect password")
  ) {
    return "A senha atual está incorreta.";
  }

  if (mensagem.includes("password") && mensagem.includes("same")) {
    return "A nova senha deve ser diferente da senha atual.";
  }

  return error?.message || "Não foi possível atualizar sua senha.";
}

const opcoesEscolaridade = [
  { value: "Ensino fundamental", label: "Ensino fundamental" },
  { value: "Ensino médio", label: "Ensino médio" },
  { value: "Ensino técnico", label: "Ensino técnico" },
  { value: "Ensino superior incompleto", label: "Ensino superior incompleto" },
  { value: "Ensino superior completo", label: "Ensino superior completo" },
  { value: "Pós-graduação", label: "Pós-graduação" },
];

const opcoesSituacao = [
  { value: "Estudante", label: "Estudante" },
  { value: "Procurando emprego", label: "Procurando emprego" },
  { value: "Empregado", label: "Empregado" },
  { value: "Estagiário", label: "Estagiário" },
  { value: "Autônomo", label: "Autônomo" },
  { value: "Empreendedor", label: "Empreendedor" },
  { value: "Outro", label: "Outro" },
];

const opcoesObjetivo = [
  { value: "Conseguir meu primeiro emprego", label: "Conseguir meu primeiro emprego" },
  { value: "Conseguir um estágio", label: "Conseguir um estágio" },
  { value: "Melhorar meu currículo", label: "Melhorar meu currículo" },
  { value: "Desenvolver novas habilidades", label: "Desenvolver novas habilidades" },
  { value: "Mudar de área profissional", label: "Mudar de área profissional" },
  { value: "Crescer profissionalmente", label: "Crescer profissionalmente" },
  { value: "Empreender", label: "Empreender" },
];

// =========================================================
// TIPOS
// =========================================================

interface UF {
  id: number;
  sigla: string;
  nome: string;
}

interface Municipio {
  id: number;
  nome: string;
}

interface Usuario {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profile?: {
    telefone?: string | null;
    dataNascimento?: string | null;
    cidade?: string | null;
    estado?: string | null;
    escolaridade?: string | null;
    situacaoProfissional?: string | null;
    objetivoPrincipal?: string | null;
  } | null;
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

export default function Account() {
  // Agora extraímos também a função "refetch" para forçar a atualização da sessão
  const { data: session, isPending, refetch } = authClient.useSession();

  const [activeSection, setActiveSection] = useState("perfil");

  // PERFIL
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);

  // LOCALIZAÇÃO
  const [estados, setEstados] = useState<UF[]>([]);
  const [cidades, setCidades] = useState<Municipio[]>([]);
  const [estado, setEstado] = useState("");
  const [city, setCity] = useState("");
  const [loadingCidades, setLoadingCidades] = useState(false);

  // CADASTRO COMPLEMENTAR
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [goal, setGoal] = useState("");

  // SEGURANÇA
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // LOADING
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingComplementary, setLoadingComplementary] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [creatingPassword, setCreatingPassword] = useState(false);

  // MENSAGENS
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputFotoRef = useRef<HTMLInputElement>(null);

  // MENU
  const menuItems = [
    {
      id: "perfil",
      label: "Meu perfil",
      description: "Informações pessoais",
      icon: User,
    },
    {
      id: "complementar",
      label: "Completar cadastro",
      description: "Conte mais sobre você",
      icon: CircleUserRound,
    },
    {
      id: "seguranca",
      label: "Segurança",
      description: "Alterar senha",
      icon: ShieldCheck,
    },
  ];

  function limparMensagens() {
    setMessage("");
    setError("");
  }

  // =========================================================
  // EFEITO PARA FORÇAR A ATUALIZAÇÃO DA SESSÃO APÓS LOGIN GOOGLE
  // =========================================================

  useEffect(() => {
    // Se o isPending acabou (já checou a sessão inicial) mas o usuário ainda não está no state
    // É provável que o cookie do OAuth tenha acabado de ser setado.
    if (!isPending && !session?.user) {
      // Força o SDK a buscar a sessão novamente no servidor
      refetch();
    }
  }, [isPending, session, refetch]);

  // =========================================================
  // VERIFICAR SE O USUÁRIO TEM SENHA CADASTRADA
  // =========================================================

  async function verificarContasVinculadas() {
    try {
      const { data: accounts, error } = await authClient.listAccounts();

      if (error) {
        console.error("Erro ao listar contas:", error);
        setHasPassword(false);
        return;
      }

      const temSenha = accounts?.some(
        (acc: any) => acc.providerId === "credential"
      );

      setHasPassword(!!temSenha);
    } catch (err) {
      console.error("Erro ao verificar contas:", err);
      setHasPassword(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      verificarContasVinculadas();
    }
  }, [session]);

  // =========================================================
  // CRIAR SENHA (para usuários que entraram via Google)
  // =========================================================

  async function criarSenha() {
    limparMensagens();

    if (!email) {
      setError("E-mail não encontrado.");
      return;
    }

    try {
      setCreatingPassword(true);

      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw new Error(
          resetError.message ||
          "Não foi possível enviar o e-mail para criar sua senha."
        );
      }

      setMessage(
        "Enviamos um link para o seu e-mail. Clique nele para criar sua senha."
      );
    } catch (error: any) {
      console.error("Erro ao criar senha:", error);
      setError(
        error?.message ||
        "Não foi possível enviar o e-mail para criar sua senha. Tente novamente."
      );
    } finally {
      setCreatingPassword(false);
    }
  }

  // =========================================================
  // CARREGAR ESTADOS
  // =========================================================

  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar estados.");
        return response.json();
      })
      .then(setEstados)
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  // =========================================================
  // CARREGAR CIDADES
  // =========================================================

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      setCity("");
      return;
    }

    setLoadingCidades(true);

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar cidades.");
        return response.json();
      })
      .then((data) => setCidades(data))
      .catch((err) => {
        console.error("Erro ao carregar cidades:", err);
        setCidades([]);
      })
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  // =========================================================
  // CARREGAR USUÁRIO
  // =========================================================

  useEffect(() => {
    async function carregarUsuario() {
      try {
        limparMensagens();

        const { data: usuario } = await api.get<Usuario>("/user/me");

        setName(usuario.name ?? "");
        setEmail(usuario.email ?? "");

        setPhone(
          usuario.profile?.telefone
            ? mascararTelefone(usuario.profile.telefone)
            : ""
        );

        setBirthDate(
          usuario.profile?.dataNascimento
            ? new Date(usuario.profile.dataNascimento).toISOString().split("T")[0]
            : ""
        );

        setEstado(usuario.profile?.estado ?? "");
        setCity(usuario.profile?.cidade ?? "");

        setEducation(usuario.profile?.escolaridade ?? "");
        setOccupation(usuario.profile?.situacaoProfissional ?? "");
        setGoal(usuario.profile?.objetivoPrincipal ?? "");

        setFotoAtual(usuario.image || session?.user?.image || null);
      } catch (error: any) {
        console.error("Erro ao carregar usuário:", error);

        const msg =
          error.response?.data?.error ||
          error.message ||
          "Erro ao carregar dados do usuário.";

        setError(msg);
      }
    }

    if (session?.user) {
      carregarUsuario();
    }
  }, [session]);

  // =========================================================
  // ALTERAR FOTO
  // =========================================================

  async function handleFotoSelecionada(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    limparMensagens();

    if (!["image/jpeg", "image/png"].includes(arquivo.type)) {
      setError("Apenas arquivos JPG e PNG são permitidos.");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    try {
      setUploadingFoto(true);

      const formData = new FormData();
      formData.append("foto", arquivo);

      const { data } = await api.post("/user/me/foto", formData);

      setFotoAtual(data.image);
      setMessage("Foto atualizada com sucesso.");
    } catch (error: any) {
      console.error("Erro ao enviar foto:", error);

      const msg =
        error.response?.data?.error ||
        error.message ||
        "Erro ao enviar foto.";

      setError(msg);
    } finally {
      setUploadingFoto(false);

      if (inputFotoRef.current) {
        inputFotoRef.current.value = "";
      }
    }
  }

  // =========================================================
  // SALVAR PERFIL
  // =========================================================

  async function salvarPerfil() {
    try {
      setLoadingProfile(true);
      limparMensagens();

      const { data: dados } = await api.put("/user/me", {
        name,
        telefone: phone.replace(/\D/g, ""),
        dataNascimento: birthDate || null,
        estado,
        cidade: city,
      });

      setName(dados.name ?? name);
      setEmail(dados.email ?? email);

      setPhone(
        dados.profile?.telefone
          ? mascararTelefone(dados.profile.telefone)
          : phone
      );

      setBirthDate(
        dados.profile?.dataNascimento
          ? new Date(dados.profile.dataNascimento).toISOString().split("T")[0]
          : birthDate
      );

      setEstado(dados.profile?.estado ?? estado);
      setCity(dados.profile?.cidade ?? city);

      setMessage("Perfil atualizado com sucesso.");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);

      const msg =
        error.response?.data?.error ||
        error.message ||
        "Erro ao atualizar seu perfil.";

      setError(msg);
    } finally {
      setLoadingProfile(false);
    }
  }

  // =========================================================
  // SALVAR CADASTRO COMPLEMENTAR
  // =========================================================

  async function salvarCadastro() {
    try {
      setLoadingComplementary(true);
      limparMensagens();

      const { data: dados } = await api.put("/user/me", {
        escolaridade: education,
        situacaoProfissional: occupation,
        objetivoPrincipal: goal,
      });

      setEducation(dados.profile?.escolaridade ?? education);
      setOccupation(dados.profile?.situacaoProfissional ?? occupation);
      setGoal(dados.profile?.objetivoPrincipal ?? goal);

      setMessage("Informações salvas com sucesso.");
    } catch (error: any) {
      console.error("Erro ao salvar cadastro:", error);

      const msg =
        error.response?.data?.error ||
        error.message ||
        "Erro ao salvar informações.";

      setError(msg);
    } finally {
      setLoadingComplementary(false);
    }
  }

  // =========================================================
  // ALTERAR SENHA (via SDK do Neon)
  // =========================================================

  async function alterarSenha() {
    limparMensagens();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos de senha.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação da senha não corresponde à nova senha.");
      return;
    }

    try {
      setLoadingPassword(true);

      const { error: changeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (changeError) {
        throw new Error(
          changeError.message || "Não foi possível alterar sua senha."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Senha alterada com sucesso.");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);

      const mensagem =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível atualizar sua senha.";

      setError(obterMensagemErroSenha({ message: mensagem }));
    } finally {
      setLoadingPassword(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (isPending) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-color, #f0f7ff)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando sua conta...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // SEM SESSÃO
  // =========================================================

  if (!session?.user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--bg-color, #f0f7ff)" }}
      >
        <div
          className="rounded-2xl p-6 text-center shadow-lg"
          style={{ backgroundColor: "var(--card-bg, white)" }}
        >
          <h1 className="text-lg font-bold">Sessão não encontrada</h1>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-muted, #6b7280)" }}
          >
            Faça login para acessar sua conta.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        backgroundColor: "var(--bg-color, #f0f7ff)",
        color: "var(--text-color, #111827)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* CABEÇALHO */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Minha conta</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-muted, #6b7280)" }}
          >
            Gerencie suas informações e segurança.
          </p>
        </div>

        {/* MENSAGENS */}
        {message && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          {/* MENU */}
          <aside
            className="rounded-2xl border p-2 h-fit"
            style={{
              backgroundColor: "var(--card-bg, white)",
              borderColor: "var(--border-color, #e5e7eb)",
            }}
          >
            <div className="px-4 py-5 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#23A6F0] flex items-center justify-center overflow-hidden">
                  {fotoAtual ? (
                    <img
                      src={fotoAtual}
                      alt={name || session.user.name || "Foto do usuário"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={21} color="white" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {name || session.user.name || "Seu nome"}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted, #9ca3af)" }}
                  >
                    {email || session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition cursor-pointer ${
                      active
                        ? "bg-[#1E40AF]/10 text-[#1E40AF]"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-[#1E40AF]" : "text-gray-400"}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* CONTEÚDO */}
          <main className="min-w-0">
            {/* PERFIL */}
            {activeSection === "perfil" && (
              <section
                className="rounded-2xl border"
                style={{
                  backgroundColor: "var(--card-bg, white)",
                  borderColor: "var(--border-color, #e5e7eb)",
                }}
              >
                <div
                  className="px-6 py-5 border-b"
                  style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                >
                  <h2 className="text-lg font-bold">Meu perfil</h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Atualize suas informações básicas de cadastro.
                  </p>
                </div>

                <div className="p-6">
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFotoSelecionada}
                  />

                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-16 h-16 rounded-full bg-[#23A6F0] flex items-center justify-center overflow-hidden">
                      {fotoAtual ? (
                        <img
                          src={fotoAtual}
                          alt={name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User size={28} color="white" />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold">Foto de perfil</p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-muted, #9ca3af)" }}
                      >
                        Opcional. JPG ou PNG, máximo 2MB.
                      </p>

                      <button
                        type="button"
                        onClick={() => inputFotoRef.current?.click()}
                        disabled={uploadingFoto}
                        className="mt-2 text-xs font-semibold text-[#23A6F0] hover:underline disabled:opacity-60 enabled:cursor-pointer disabled:cursor-not-allowed"
                      >
                        {uploadingFoto ? "Enviando..." : "Alterar foto"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Nome completo
                      </label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-muted, #9ca3af)" }}
                        />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-muted, #9ca3af)" }}
                        />
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-muted, #9ca3af)" }}
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(mascararTelefone(e.target.value))
                          }
                          placeholder="(00) 00000-0000"
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Data de nascimento
                      </label>
                      <div className="relative">
                        <Calendar
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-muted, #9ca3af)" }}
                        />
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Estado
                      </label>
                      <SelectCustom
                        value={estado}
                        onChange={setEstado}
                        options={estados.map((uf) => ({
                          value: uf.sigla,
                          label: uf.nome,
                        }))}
                        placeholder="Selecione o estado"
                        icon={<MapPin size={16} />}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Cidade
                      </label>
                      <SelectCustom
                        value={city}
                        onChange={setCity}
                        options={cidades.map((c) => ({
                          value: c.nome,
                          label: c.nome,
                        }))}
                        placeholder={
                          loadingCidades
                            ? "Carregando..."
                            : !estado
                              ? "Selecione o estado primeiro"
                              : "Selecione a cidade"
                        }
                        disabled={!estado || loadingCidades}
                        icon={<MapPin size={16} />}
                      />
                    </div>
                  </div>

                  <div
                    className="flex justify-end mt-6 pt-5 border-t"
                    style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                  >
                    <button
                      type="button"
                      onClick={salvarPerfil}
                      disabled={loadingProfile}
                      className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 enabled:cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingProfile ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {loadingProfile ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* COMPLETAR CADASTRO */}
            {activeSection === "complementar" && (
              <section
                className="rounded-2xl border"
                style={{
                  backgroundColor: "var(--card-bg, white)",
                  borderColor: "var(--border-color, #e5e7eb)",
                }}
              >
                <div
                  className="px-6 py-5 border-b"
                  style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                >
                  <h2 className="text-lg font-bold">Completar cadastro</h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Essas informações ajudam o Oportuniza a entender melhor seu
                    perfil e seus objetivos profissionais.
                  </p>
                </div>

                <div className="p-6">
                  <div
                    className="flex gap-3 p-4 rounded-xl mb-6"
                    style={{ backgroundColor: "var(--bg-subtle)" }}
                  >
                    <CircleUserRound
                      size={20}
                      className="text-[#23A6F0] shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        Complete seu perfil
                      </p>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: "var(--text-muted, #6b7280)" }}
                      >
                        Responder algumas informações é opcional, mas elas
                        podem ajudar a oferecer uma experiência mais adequada
                        aos seus objetivos.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Escolaridade
                      </label>
                      <SelectCustom
                        value={education}
                        onChange={setEducation}
                        options={opcoesEscolaridade}
                        placeholder="Selecione"
                        icon={<GraduationCap size={16} />}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Situação profissional
                      </label>
                      <SelectCustom
                        value={occupation}
                        onChange={setOccupation}
                        options={opcoesSituacao}
                        placeholder="Selecione"
                        icon={<Briefcase size={16} />}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1.5">
                        Principal objetivo
                      </label>
                      <SelectCustom
                        value={goal}
                        onChange={setGoal}
                        options={opcoesObjetivo}
                        placeholder="Selecione"
                      />
                    </div>
                  </div>

                  <div
                    className="flex justify-end mt-6 pt-5 border-t"
                    style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                  >
                    <button
                      type="button"
                      onClick={salvarCadastro}
                      disabled={loadingComplementary}
                      className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 enabled:cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingComplementary ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {loadingComplementary
                        ? "Salvando..."
                        : "Salvar informações"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* SEGURANÇA */}
            {activeSection === "seguranca" && (
              <section
                className="rounded-2xl border"
                style={{
                  backgroundColor: "var(--card-bg, white)",
                  borderColor: "var(--border-color, #e5e7eb)",
                }}
              >
                <div
                  className="px-6 py-5 border-b"
                  style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                >
                  <h2 className="text-lg font-bold">Segurança</h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    Gerencie a senha da sua conta.
                  </p>
                </div>

                <div className="p-6">
                  {/* ⚠️ AINDA VERIFICANDO SE TEM SENHA */}
                  {hasPassword === null && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Verificando sua conta...</span>
                    </div>
                  )}

                  {/* ⚠️ USUÁRIO NÃO TEM SENHA (login via Google) */}
                  {hasPassword === false && (
                    <div className="flex flex-col gap-4">
                      <div
                        className="flex items-start gap-3 p-4 rounded-xl border"
                        style={{
                          backgroundColor: "var(--bg-subtle, #f3f4f6)",
                          borderColor: "var(--border-color, #e5e7eb)",
                        }}
                      >
                        <AlertCircle
                          size={20}
                          className="text-[#23A6F0] shrink-0 mt-0.5"
                        />
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-color, #1f2937)" }}
                          >
                            Sua conta não possui senha
                          </p>
                          <p
                            className="text-xs mt-1 leading-relaxed"
                            style={{ color: "var(--text-muted, #6b7280)" }}
                          >
                            Você entrou usando o Google. Se quiser, pode criar
                            uma senha para acessar sua conta também por e-mail
                            e senha.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={criarSenha}
                        disabled={creatingPassword}
                        className="flex items-center justify-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 w-fit enabled:cursor-pointer disabled:cursor-not-allowed"
                      >
                        {creatingPassword ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Lock size={16} />
                        )}
                        {creatingPassword
                          ? "Enviando e-mail..."
                          : "Criar senha"}
                      </button>
                    </div>
                  )}

                  {/* ⚠️ USUÁRIO JÁ TEM SENHA (cadastro manual) */}
                  {hasPassword === true && (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 flex items-center justify-center">
                          <Lock size={19} className="text-[#1E40AF]" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Senha da conta
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted, #9ca3af)" }}
                          >
                            Sua senha deve ter pelo menos 8 caracteres.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <PasswordInput
                          label="Senha atual"
                          value={currentPassword}
                          onChange={setCurrentPassword}
                          show={showCurrentPassword}
                          setShow={setShowCurrentPassword}
                        />

                        <PasswordInput
                          label="Nova senha"
                          value={newPassword}
                          onChange={setNewPassword}
                          show={showNewPassword}
                          setShow={setShowNewPassword}
                        />

                        <PasswordInput
                          label="Confirmar nova senha"
                          value={confirmPassword}
                          onChange={setConfirmPassword}
                          show={showConfirmPassword}
                          setShow={setShowConfirmPassword}
                        />
                      </div>

                      <div
                        className="flex justify-end mt-6 pt-5 border-t"
                        style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                      >
                        <button
                          type="button"
                          onClick={alterarSenha}
                          disabled={loadingPassword}
                          className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 enabled:cursor-pointer disabled:cursor-not-allowed"
                        >
                          {loadingPassword ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Lock size={16} />
                          )}
                          {loadingPassword ? "Salvando..." : "Alterar senha"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// INPUT DE SENHA
// =========================================================

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
}: PasswordInputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">{label}</label>

      <div className="relative">
        <Lock
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted, #9ca3af)" }}
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
          style={{ color: "var(--text-muted, #9ca3af)" }}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}