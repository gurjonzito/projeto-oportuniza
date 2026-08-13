import { Tv2, PlayCircle, BookOpen, Tag, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    label: "Canais",
    description: "Gerencie os canais do YouTube curados na plataforma.",
    icon: Tv2,
    path: "/admin/canais",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    label: "Vídeos",
    description: "Curadoria de vídeos: tags, destaque e associação a trilhas.",
    icon: PlayCircle,
    path: "/admin/videos",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    label: "Trilhas",
    description: "Crie e organize trilhas de aprendizado com vídeos em ordem.",
    icon: BookOpen,
    path: "/admin/trilhas",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Categorias",
    description: "Categorias que organizam as trilhas na plataforma.",
    icon: Tag,
    path: "/admin/categorias",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    label: "Recursos",
    description: "Ferramentas, plataformas e sites úteis.",
    icon: Link,
    path: "/admin/recursos",
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
];

export default function AdminOverview() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-color)" }}
        >
          Visão Geral
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-muted, #6b7280)" }}
        >
          Gerencie o conteúdo da plataforma.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="flex items-start gap-4 p-5 rounded-xl border text-left hover:border-blue-300 hover:shadow-sm transition-all group"
              style={{
                backgroundColor: "var(--card-bg, white)",
                borderColor: "var(--border-color, #e5e7eb)",
              }}
            >
              <div
                className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p
                  className="font-semibold text-sm mb-1 group-hover:text-[#1E40AF] transition-colors"
                  style={{ color: "var(--text-color)" }}
                >
                  {s.label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  {s.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}