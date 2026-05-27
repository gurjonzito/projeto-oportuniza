import { prisma } from "../config/prisma";
import { buscarPlaylist, buscarVideosPlaylist } from "./youtubeService";
import { extractPlaylistId } from "../utils/extractPlaylistId";
import { slugify } from "../utils/slugify";

const TITULOS_PRIVADOS = [
  "private video",
  "deleted video",
  "video privado",
  "vídeo privado",
]

function isVideoPrivado(titulo: string): boolean {
  return TITULOS_PRIVADOS.includes(titulo.trim().toLowerCase())
}

export async function importarPlaylistService(url: string, categoriaId: string) {
  console.log("URL RECEBIDA NO SERVICE:", url);

  const playlistId = extractPlaylistId(url);
  console.log("PLAYLIST ID EXTRAÍDO:", playlistId);

  if (!playlistId) throw new Error("Playlist inválida");

  const existingTrilha = await prisma.trilha.findFirst({
    where: { youtubePlaylistId: playlistId },
  });

  if (existingTrilha) throw new Error("Playlist já importada");

  const playlistData = await buscarPlaylist(playlistId);
  const videosData = await buscarVideosPlaylist(playlistId);

  const firstVideo = videosData[0];
  const youtubeChannelId = firstVideo?.snippet?.videoOwnerChannelId || "unknown";
  const channelName =
    firstVideo?.snippet?.videoOwnerChannelTitle ||
    firstVideo?.snippet?.channelTitle ||
    "Canal";

  let canal = await prisma.canal.findUnique({ where: { youtubeChannelId } });

  if (!canal) {
    canal = await prisma.canal.create({
      data: {
        youtubeChannelId,
        nome: channelName,
        descricao: "",
        thumbnailUrl: playlistData.snippet.thumbnails.high?.url,
      },
    });
  }

  const trilha = await prisma.trilha.create({
    data: {
      titulo: playlistData.snippet.title,
      descricao: playlistData.snippet.description,
      thumbnailUrl: playlistData.snippet.thumbnails.high?.url,
      youtubePlaylistId: playlistId,
      slug: slugify(playlistData.snippet.title),
      categoriaId,
      canalId: canal.id,
      isCurated: true,
    },
  });

  // Filtra vídeos privados/deletados antes de salvar
  const videosValidos = videosData.filter(
    (item: any) => !isVideoPrivado(item.snippet.title)
  );

  for (let i = 0; i < videosValidos.length; i++) {
    const item = videosValidos[i];
    const videoId = item.snippet.resourceId.videoId;

    let video = await prisma.video.findUnique({
      where: { youtubeVideoId: videoId },
    });

    if (!video) {
      video = await prisma.video.create({
        data: {
          youtubeVideoId: videoId,
          titulo: item.snippet.title,
          descricao: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high?.url,
          canalId: canal.id,
          tags: [],
          isCurated: true,
        },
      });
    }

    const relationExists = await prisma.trilhaVideo.findFirst({
      where: { trilhaId: trilha.id, videoId: video.id },
    });

    if (!relationExists) {
      await prisma.trilhaVideo.create({
        data: {
          trilhaId: trilha.id,
          videoId: video.id,
          ordem: i + 1,
        },
      });
    }
  }

  return trilha;
}

export async function listarTrilhasService() {
  return prisma.trilha.findMany({
    where: { ativa: true },
    include: {
      categoria: true,
      canal: true,
      videos: true,
    },
    orderBy: { criadaEm: "desc" },
  });
}

export async function buscarTrilhaService(slug: string) {
  const trilha = await prisma.trilha.findUnique({
    where: { slug },
    include: {
      categoria: true,
      canal: true,
      videos: {
        include: {
          video: {
            include: {
              canal: { select: { nome: true } }
            }
          },
        },
        orderBy: { ordem: "asc" },
      },
    },
  });

  if (!trilha) return null;

  // Filtra vídeos privados/deletados já salvos no banco
  return {
    ...trilha,
    videos: trilha.videos.filter(
      (tv) => !isVideoPrivado(tv.video.titulo)
    ),
  };
}