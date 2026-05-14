import type { Video } from "../types/video"

export const videosMock: Video[] = [
  {
    id: "curriculo",
    videoId: "1",
    title: "Como montar um currículo profissional",
    channel: "Curso em Vídeo",
    duration: "10:00",
    thumbnail: "",
    category: "emprego",
    summary:
      "Aprenda como montar um currículo profissional que chama atenção.",

    materials: [
      {
        name: "Modelo de currículo",
        file: "/files/modelo_curriculo.docx",
      },
    ],
  },
  {
    id: "entrevista",
    videoId: "2",
    title: "Entrevista de emprego",
    channel: "Sebrae",
    duration: "10:00",
    thumbnail: "https://img.youtube.com/vi/3nQNiWdeH2Q/hqdefault.jpg",
    category: "emprego",
    summary:
      "Descrição",
  },
  {
    id: "excel",
    videoId: "3",
    title: "Excel básico",
    channel: "Senai",
    duration: "10:00",
    thumbnail: "https://img.youtube.com/vi/rwbho0CgEAE/hqdefault.jpg",
    category: "tecnologia",
    summary:
      "Descrição.",
  },
]