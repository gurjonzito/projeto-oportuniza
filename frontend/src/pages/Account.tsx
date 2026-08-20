import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Link as LinkIcon,
  CheckCircle2,
  CircleUserRound,
  Briefcase,
  MapPin,
  Calendar,
  Phone,
  GraduationCap,
  Unlink,
} from "lucide-react";

import { useSession } from "../lib/auth-client";

export default function Account() {
  const { data: session, isPending } = useSession();

  const [activeSection, setActiveSection] = useState("perfil");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");

  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [goal, setGoal] = useState("");

  const [hasPassword] = useState(true);
  const [googleLinked, setGoogleLinked] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [loadingComplementary, setLoadingComplementary] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      description: "Senha e acesso",
      icon: ShieldCheck,
    },
    {
      id: "contas",
      label: "Contas vinculadas",
      description: "Google e outros acessos",
      icon: LinkIcon,
    },
  ];

  // ==========================================
  // CARREGAR DADOS DO USUÁRIO
  // ==========================================

  useEffect(() => {
    async function carregarUsuario() {
      try {
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const erro = await response.json().catch(() => null);

          throw new Error(
            erro?.error ||
              "Não foi possível carregar os dados do usuário."
          );
        }

        const usuario = await response.json();

        setName(usuario.name ?? "");
        setEmail(usuario.email ?? "");
        setPhone(usuario.telefone ?? "");
        setBirthDate(usuario.dataNascimento ?? "");
        setCity(usuario.cidade ?? "");
        setEducation(usuario.escolaridade ?? "");
        setOccupation(usuario.situacaoProfissional ?? "");
        setGoal(usuario.objetivoPrincipal ?? "");
      } catch (error: any) {
        console.error(
          "Erro ao carregar usuário:",
          error
        );

        setError(
          error.message ||
            "Erro ao carregar dados do usuário."
        );
      }
    }

    if (session?.user) {
      carregarUsuario();
    }
  }, [session]);

  // ==========================================
  // SALVAR PERFIL
  // ==========================================

  async function salvarPerfil() {
    try {
      setLoadingProfile(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/me`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            telefone: phone,
            dataNascimento: birthDate,
            cidade: city,
          }),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados?.error ||
            "Erro ao atualizar seu perfil."
        );
      }

      setName(dados.name ?? name);
      setEmail(dados.email ?? email);
      setPhone(dados.telefone ?? phone);
      setBirthDate(
        dados.dataNascimento ?? birthDate
      );
      setCity(dados.cidade ?? city);

      setMessage(
        "Perfil atualizado com sucesso."
      );
    } catch (error: any) {
      console.error(
        "Erro ao salvar perfil:",
        error
      );

      setError(
        error.message ||
          "Erro ao atualizar seu perfil."
      );
    } finally {
      setLoadingProfile(false);
    }
  }

  // ==========================================
  // SALVAR CADASTRO COMPLEMENTAR
  // ==========================================

  async function salvarCadastro() {
    try {
      setLoadingComplementary(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/me`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            escolaridade: education,
            situacaoProfissional: occupation,
            objetivoPrincipal: goal,
          }),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados?.error ||
            "Erro ao atualizar suas informações."
        );
      }

      setEducation(
        dados.escolaridade ?? education
      );

      setOccupation(
        dados.situacaoProfissional ??
          occupation
      );

      setGoal(
        dados.objetivoPrincipal ?? goal
      );

      setMessage(
        "Informações salvas com sucesso."
      );
    } catch (error: any) {
      console.error(
        "Erro ao salvar cadastro:",
        error
      );

      setError(
        error.message ||
          "Erro ao salvar informações."
      );
    } finally {
      setLoadingComplementary(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (isPending) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor:
            "var(--bg-color, #f0f7ff)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />

          <span className="text-sm font-medium">
            Carregando sua conta...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // SEM SESSÃO
  // ==========================================

  if (!session?.user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundColor:
            "var(--bg-color, #f0f7ff)",
        }}
      >
        <div
          className="rounded-2xl p-6 text-center shadow-lg"
          style={{
            backgroundColor:
              "var(--card-bg, white)",
          }}
        >
          <h1 className="text-lg font-bold">
            Sessão não encontrada
          </h1>

          <p
            className="text-sm mt-2"
            style={{
              color:
                "var(--text-muted, #6b7280)",
            }}
          >
            Faça login para acessar sua conta.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // INTERFACE
  // ==========================================

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        backgroundColor:
          "var(--bg-color, #f0f7ff)",
        color:
          "var(--text-color, #111827)",
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho */}

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Minha conta
          </h1>

          <p
            className="text-sm mt-1"
            style={{
              color:
                "var(--text-muted, #6b7280)",
            }}
          >
            Gerencie suas informações, segurança
            e preferências.
          </p>
        </div>

        {/* Mensagens */}

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

          {/* Menu lateral */}

          <aside
            className="rounded-2xl border p-2 h-fit"
            style={{
              backgroundColor:
                "var(--card-bg, white)",
              borderColor:
                "var(--border-color, #e5e7eb)",
            }}
          >

            {/* Avatar */}

            <div className="px-4 py-5 mb-2">
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full bg-[#23A6F0] flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={21}
                      color="white"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {name ||
                      session.user.name ||
                      "Seu nome"}
                  </p>

                  <p
                    className="text-xs truncate"
                    style={{
                      color:
                        "var(--text-muted, #9ca3af)",
                    }}
                  >
                    {email ||
                      session.user.email}
                  </p>
                </div>

              </div>
            </div>

            {/* Navegação */}

            <nav className="space-y-1">

              {menuItems.map((item) => {
                const Icon = item.icon;

                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(item.id)
                    }
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
                      active
                        ? "bg-[#1E40AF]/10 text-[#1E40AF]"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-[#1E40AF]"
                          : "text-gray-400"
                      }
                    />

                    <div className="min-w-0">

                      <p className="text-sm font-semibold">
                        {item.label}
                      </p>

                      <p
                        className="text-[11px] mt-0.5"
                        style={{
                          color:
                            "var(--text-muted, #9ca3af)",
                        }}
                      >
                        {item.description}
                      </p>

                    </div>
                  </button>
                );
              })}

            </nav>
          </aside>

          {/* Conteúdo */}

          <main className="min-w-0">

            {/* ================================================= */}
            {/* PERFIL */}
            {/* ================================================= */}

            {activeSection === "perfil" && (
              <section
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor:
                    "var(--card-bg, white)",
                  borderColor:
                    "var(--border-color, #e5e7eb)",
                }}
              >

                <div
                  className="px-6 py-5 border-b"
                  style={{
                    borderColor:
                      "var(--border-color, #e5e7eb)",
                  }}
                >
                  <h2 className="text-lg font-bold">
                    Meu perfil
                  </h2>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted, #6b7280)",
                    }}
                  >
                    Atualize suas informações
                    básicas de cadastro.
                  </p>
                </div>

                <div className="p-6">

                  {/* Avatar */}

                  <div className="flex items-center gap-4 mb-7">

                    <div className="w-16 h-16 rounded-full bg-[#23A6F0] flex items-center justify-center overflow-hidden">

                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User
                          size={28}
                          color="white"
                        />
                      )}

                    </div>

                    <div>

                      <p className="font-semibold">
                        Foto de perfil
                      </p>

                      <p
                        className="text-xs mt-1"
                        style={{
                          color:
                            "var(--text-muted, #9ca3af)",
                        }}
                      >
                        Opcional. JPG ou PNG.
                      </p>

                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-[#23A6F0] hover:underline"
                      >
                        Alterar foto
                      </button>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Nome */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Nome completo
                      </label>

                      <div className="relative">

                        <User
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />

                      </div>
                    </div>

                    {/* Email */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Email
                      </label>

                      <div className="relative">

                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <input
                          type="email"
                          value={email}
                          disabled
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none opacity-70 cursor-not-allowed"
                        />

                      </div>
                    </div>

                    {/* Telefone */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Telefone
                      </label>

                      <div className="relative">

                        <Phone
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="(00) 00000-0000"
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />

                      </div>
                    </div>

                    {/* Data nascimento */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Data de nascimento
                      </label>

                      <div className="relative">

                        <Calendar
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) =>
                            setBirthDate(
                              e.target.value
                            )
                          }
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />

                      </div>
                    </div>

                    {/* Cidade */}

                    <div className="md:col-span-2">

                      <label className="block text-xs font-semibold mb-1.5">
                        Cidade
                      </label>

                      <div className="relative">

                        <MapPin
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <input
                          type="text"
                          value={city}
                          onChange={(e) =>
                            setCity(e.target.value)
                          }
                          placeholder="Sua cidade"
                          className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                        />

                      </div>
                    </div>

                  </div>

                  <div
                    className="flex justify-end mt-6 pt-5 border-t"
                    style={{
                      borderColor:
                        "var(--border-color, #e5e7eb)",
                    }}
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

                      {loadingProfile
                        ? "Salvando..."
                        : "Salvar alterações"}

                    </button>

                  </div>

                </div>
              </section>
            )}

            {/* ================================================= */}
            {/* COMPLETAR CADASTRO */}
            {/* ================================================= */}

            {activeSection === "complementar" && (
              <section
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor:
                    "var(--card-bg, white)",
                  borderColor:
                    "var(--border-color, #e5e7eb)",
                }}
              >

                <div
                  className="px-6 py-5 border-b"
                  style={{
                    borderColor:
                      "var(--border-color, #e5e7eb)",
                  }}
                >

                  <h2 className="text-lg font-bold">
                    Completar cadastro
                  </h2>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted, #6b7280)",
                    }}
                  >
                    Essas informações ajudam o
                    Oportuniza a entender melhor seu
                    perfil e seus objetivos
                    profissionais.
                  </p>

                </div>

                <div className="p-6">

                  <div
                    className="flex gap-3 p-4 rounded-xl mb-6"
                    style={{
                      backgroundColor:
                        "var(--bg-subtle, #f9fafb)",
                    }}
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
                        style={{
                          color:
                            "var(--text-muted, #6b7280)",
                        }}
                      >
                        Responder algumas
                        informações é opcional,
                        mas elas podem ajudar a
                        oferecer uma experiência
                        mais adequada aos seus
                        objetivos.
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Escolaridade */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Escolaridade
                      </label>

                      <div className="relative">

                        <GraduationCap
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <select
                          value={education}
                          onChange={(e) =>
                            setEducation(
                              e.target.value
                            )
                          }
                          className="auth-input appearance-none w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none dark:scheme:dark"
                        >
                          <option value="">
                            Selecione
                          </option>

                          <option>
                            Ensino fundamental
                          </option>

                          <option>
                            Ensino médio
                          </option>

                          <option>
                            Ensino técnico
                          </option>

                          <option>
                            Ensino superior incompleto
                          </option>

                          <option>
                            Ensino superior completo
                          </option>

                          <option>
                            Pós-graduação
                          </option>
                        </select>

                      </div>
                    </div>

                    {/* Situação profissional */}

                    <div>

                      <label className="block text-xs font-semibold mb-1.5">
                        Situação profissional
                      </label>

                      <div className="relative">

                        <Briefcase
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        />

                        <select
                          value={occupation}
                          onChange={(e) =>
                            setOccupation(
                              e.target.value
                            )
                          }
                          className="auth-input appearance-none w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none dark:scheme:dark"
                        >
                          <option value="">
                            Selecione
                          </option>

                          <option>
                            Estudante
                          </option>

                          <option>
                            Procurando emprego
                          </option>

                          <option>
                            Empregado
                          </option>

                          <option>
                            Estagiário
                          </option>

                          <option>
                            Autônomo
                          </option>

                          <option>
                            Empreendedor
                          </option>

                          <option>
                            Outro
                          </option>
                        </select>

                      </div>
                    </div>

                    {/* Objetivo */}

                    <div className="md:col-span-2">

                      <label className="block text-xs font-semibold mb-1.5">
                        Principal objetivo
                      </label>

                      <select
                        value={goal}
                        onChange={(e) =>
                          setGoal(e.target.value)
                        }
                        className="auth-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none dark:scheme:dark"
                      >
                        <option value="">
                          Selecione
                        </option>

                        <option>
                          Conseguir meu primeiro emprego
                        </option>

                        <option>
                          Conseguir um estágio
                        </option>

                        <option>
                          Melhorar meu currículo
                        </option>

                        <option>
                          Desenvolver novas habilidades
                        </option>

                        <option>
                          Mudar de área profissional
                        </option>

                        <option>
                          Crescer profissionalmente
                        </option>

                        <option>
                          Empreender
                        </option>
                      </select>

                    </div>

                  </div>

                  <div
                    className="flex justify-end mt-6 pt-5 border-t"
                    style={{
                      borderColor:
                        "var(--border-color, #e5e7eb)",
                    }}
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

            {/* ================================================= */}
            {/* SEGURANÇA */}
            {/* ================================================= */}

            {activeSection === "seguranca" && (
              <section
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor:
                    "var(--card-bg, white)",
                  borderColor:
                    "var(--border-color, #e5e7eb)",
                }}
              >

                <div
                  className="px-6 py-5 border-b"
                  style={{
                    borderColor:
                      "var(--border-color, #e5e7eb)",
                  }}
                >

                  <h2 className="text-lg font-bold">
                    Segurança
                  </h2>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted, #6b7280)",
                    }}
                  >
                    Gerencie sua senha e as formas
                    de acesso à sua conta.
                  </p>

                </div>

                <div className="p-6">

                  <div className="flex items-center justify-between gap-4 mb-6">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 flex items-center justify-center">

                        <Lock
                          size={19}
                          className="text-[#1E40AF]"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          Senha da conta
                        </p>

                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        >
                          {hasPassword
                            ? "Sua conta possui uma senha."
                            : "Você ainda não possui uma senha."}
                        </p>

                      </div>

                    </div>

                    {hasPassword && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                        <CheckCircle2 size={14} />
                        Ativa
                      </span>
                    )}

                  </div>

                  {!hasPassword && (
                    <div
                      className="p-4 rounded-xl mb-6 border"
                      style={{
                        borderColor:
                          "var(--border-color, #e5e7eb)",
                      }}
                    >

                      <p className="text-sm font-semibold">
                        Crie uma senha para sua conta
                      </p>

                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{
                          color:
                            "var(--text-muted, #6b7280)",
                        }}
                      >
                        Você poderá continuar
                        entrando pelo Google, mas
                        também poderá acessar sua
                        conta usando email e senha.
                      </p>

                    </div>
                  )}

                  <div className="space-y-4">

                    {hasPassword && (
                      <PasswordInput
                        label="Senha atual"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        show={showCurrentPassword}
                        setShow={setShowCurrentPassword}
                      />
                    )}

                    <PasswordInput
                      label={
                        hasPassword
                          ? "Nova senha"
                          : "Criar senha"
                      }
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
                    style={{
                      borderColor:
                        "var(--border-color, #e5e7eb)",
                    }}
                  >

                    <button
                      type="button"
                      className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                    >

                      <Lock size={16} />

                      {hasPassword
                        ? "Alterar senha"
                        : "Criar senha"}

                    </button>

                  </div>

                </div>
              </section>
            )}

            {/* ================================================= */}
            {/* CONTAS VINCULADAS */}
            {/* ================================================= */}

            {activeSection === "contas" && (
              <section
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor:
                    "var(--card-bg, white)",
                  borderColor:
                    "var(--border-color, #e5e7eb)",
                }}
              >

                <div
                  className="px-6 py-5 border-b"
                  style={{
                    borderColor:
                      "var(--border-color, #e5e7eb)",
                  }}
                >

                  <h2 className="text-lg font-bold">
                    Contas vinculadas
                  </h2>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color:
                        "var(--text-muted, #6b7280)",
                    }}
                  >
                    Gerencie os serviços que você
                    utiliza para acessar sua conta.
                  </p>

                </div>

                <div className="p-6">

                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
                    style={{
                      borderColor:
                        "var(--border-color, #e5e7eb)",
                    }}
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl border flex items-center justify-center">

                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          Google
                        </p>

                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              "var(--text-muted, #9ca3af)",
                          }}
                        >
                          {googleLinked
                            ? "Conta Google vinculada"
                            : "Nenhuma conta Google vinculada"}
                        </p>

                      </div>

                    </div>

                    {googleLinked ? (
                      <button
                        type="button"
                        onClick={() =>
                          setGoogleLinked(false)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        style={{
                          borderColor:
                            "var(--border-color, #e5e7eb)",
                        }}
                      >
                        <Unlink size={14} />
                        Desvincular
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setGoogleLinked(true)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        <LinkIcon size={14} />
                        Vincular Google
                      </button>
                    )}

                  </div>

                  <div
                    className="mt-5 p-4 rounded-xl"
                    style={{
                      backgroundColor:
                        "var(--bg-subtle, #f9fafb)",
                    }}
                  >

                    <div className="flex gap-3">

                      <ShieldCheck
                        size={18}
                        className="text-[#23A6F0] shrink-0"
                      />

                      <div>

                        <p className="text-sm font-semibold">
                          Mais opções de acesso
                        </p>

                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{
                            color:
                              "var(--text-muted, #6b7280)",
                          }}
                        >
                          Vincular sua conta Google
                          permite que você utilize
                          diferentes formas de acesso
                          sem precisar criar uma
                          segunda conta no Oportuniza.
                        </p>

                      </div>

                    </div>

                  </div>

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
// COMPONENTE AUXILIAR - INPUT DE SENHA
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

      <label className="block text-xs font-semibold mb-1.5">
        {label}
      </label>

      <div className="relative">

        <Lock
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{
            color:
              "var(--text-muted, #9ca3af)",
          }}
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="••••••••"
          className="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{
            color:
              "var(--text-muted, #9ca3af)",
          }}
        >
          {show ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>

      </div>
    </div>
  );
}