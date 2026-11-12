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
  const { data: session, isPending } = authClient.useSession();

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

  const [hasGoogle, setHasGoogle] = useState<boolean>(false);
  const [linkingGoogle, setLinkingGoogle] = useState<boolean>(false);
  const [unlinkingGoogle, setUnlinkingGoogle] = useState<boolean>(false);

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
      description: "Senha e contas conectadas",
      icon: ShieldCheck,
    },
  ];

  function limparMensagens() {
    setMessage("");
    setError("");
  }

  // =========================================================
  // CAPTURAR ERROS DE RETORNO DO OAUTH NA URL (SE HOUVER)
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");

    if (oauthError) {
      setActiveSection("seguranca");

      if (oauthError === "state_mismatch") {
        setError(
          "Falha de segurança na validação com o Google (state_mismatch). Verifique os cookies do navegador e tente novamente."
        );
      } else if (oauthError === "account_already_linked_to_different_user") {
        setError("Esta conta do Google já está vinculada a outro usuário.");
      } else {
        setError(`Não foi possível vincular a conta Google (${oauthError}).`);
      }

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // =========================================================
  // VERIFICAR CONTAS VINCULADAS (SENHA E GOOGLE)
  // =========================================================

  async function verificarContasVinculadas() {
    try {
      const { data: accounts, error } = await authClient.listAccounts();

      if (error) {
        console.error("Erro ao listar contas:", error);
        setHasPassword(false);
        setHasGoogle(false);
        return;
      }

      const temSenha = accounts?.some(
        (acc: any) => acc.providerId === "credential"
      );
      const temGoogle = accounts?.some(
        (acc: any) => acc.providerId === "google"
      );

      setHasPassword(!!temSenha);
      setHasGoogle(!!temGoogle);
    } catch (err) {
      console.error("Erro ao verificar contas:", err);
      setHasPassword(false);
      setHasGoogle(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      verificarContasVinculadas();
    }
  }, [session]);

  // =========================================================
  // VINCULAR / DESVINCULAR CONTA GOOGLE
  // =========================================================

  async function vincularGoogle() {
    limparMensagens();

    try {
      setLinkingGoogle(true);

      const { error: linkError } = await authClient.linkSocial({
        provider: "google",
        callbackURL: `${window.location.origin}${window.location.pathname}`,
      });

      if (linkError) {
        throw new Error(
          linkError.message || "Não foi possível vincular sua conta Google."
        );
      }
    } catch (err: any) {
      console.error("Erro ao vincular Google:", err);
      setError(err?.message || "Erro ao conectar com o Google.");
      setLinkingGoogle(false);
    }
  }

  async function desvincularGoogle() {
    limparMensagens();

    if (!hasPassword) {
      setError(
        "Você precisa criar uma senha antes de desvincular sua conta do Google, caso contrário perderá o acesso."
      );
      return;
    }

    try {
      setUnlinkingGoogle(true);

      const { error: unlinkError } = await authClient.unlinkAccount({
        providerId: "google",
      });

      if (unlinkError) {
        throw new Error(
          unlinkError.message || "Não foi possível desvincular sua conta Google."
        );
      }

      setHasGoogle(false);
      setMessage("Conta do Google desvinculada com sucesso.");
    } catch (err: any) {
      console.error("Erro ao desvincular Google:", err);
      setError(err?.message || "Erro ao desvincular a conta do Google.");
    } finally {
      setUnlinkingGoogle(false);
    }
  }

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
                    onClick={() => {
                      limparMensagens();
                      setActiveSection(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
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
                        className="mt-2 text-xs font-semibold text-[#23A6F0] hover:underline disabled:opacity-60"
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
                      className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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
                      className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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
                    Gerencie a senha e as contas conectadas ao seu perfil.
                  </p>
                </div>

                <div className="p-6">
                  {/* VERIFICANDO CONTA */}
                  {hasPassword === null && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Verificando sua conta...</span>
                    </div>
                  )}

                  {/* USUÁRIO NÃO TEM SENHA (login via Google) */}
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
                        className="flex items-center justify-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 w-fit"
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

                  {/* USUÁRIO JÁ TEM SENHA (cadastro manual) */}
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
                          className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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

                  {/* DIVISOR */}
                  {hasPassword !== null && (
                    <>
                      <div
                        className="my-8 border-t"
                        style={{ borderColor: "var(--border-color, #e5e7eb)" }}
                      />

                      {/* CONTAS CONECTADAS (GOOGLE) */}
                      <div>
                        <h3 className="text-sm font-bold mb-1">
                          Contas conectadas
                        </h3>
                        <p
                          className="text-xs mb-4"
                          style={{ color: "var(--text-muted, #6b7280)" }}
                        >
                          Vincule sua conta Google para fazer login com um
                          clique.
                        </p>

                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
                          style={{
                            backgroundColor: "var(--bg-subtle, #f9fafb)",
                            borderColor: "var(--border-color, #e5e7eb)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                                />
                              </svg>
                            </div>

                            <div>
                              <p className="text-sm font-semibold">Google</p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted, #6b7280)" }}
                              >
                                {hasGoogle
                                  ? "Sua conta está vinculada ao Google."
                                  : "Não vinculada"}
                              </p>
                            </div>
                          </div>

                          {hasGoogle ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600">
                                Conectado
                              </span>

                              <button
                                type="button"
                                onClick={desvincularGoogle}
                                disabled={unlinkingGoogle || !hasPassword}
                                title={
                                  !hasPassword
                                    ? "Crie uma senha acima antes de desvincular o Google"
                                    : "Remover vínculo com o Google"
                                }
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {unlinkingGoogle ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : null}
                                {unlinkingGoogle
                                  ? "Desvinculando..."
                                  : "Desvincular"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={vincularGoogle}
                              disabled={linkingGoogle}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-60 w-fit"
                              style={{
                                borderColor: "var(--border-color, #d1d5db)",
                              }}
                            >
                              {linkingGoogle ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : null}
                              {linkingGoogle
                                ? "Conectando..."
                                : "Vincular conta Google"}
                            </button>
                          )}
                        </div>
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
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted, #9ca3af)" }}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}