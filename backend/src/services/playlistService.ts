import { prisma } from "../config/prisma";
import { buscarPlaylist, buscarVideosPlaylist } from "./youtubeService";
import { extractPlaylistId } from "../utils/extractPlaylistId";
import { slugify } from "../utils/slugify";

const TITULOS_PRIVADOS = [
  "private video",
  "deleted video",
  "video privado",
  "vídeo privado",
];

function isVideoPrivado(titulo: string): boolean {
  return TITULOS_PRIVADOS.includes(titulo.trim().toLowerCase());
}

async function gerarSlugUnico(titulo: string): Promise<string> {
  const base = slugify(titulo);
  let slug = base;
  let tentativa = 1;

  while (await prisma.trilha.findUnique({ where: { slug } })) {
    slug = `${base}-${tentativa++}`;
  }

  return slug;
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

  const [playlistData, videosData] = await Promise.all([
    buscarPlaylist(playlistId),
    buscarVideosPlaylist(playlistId),
  ]);

  const firstVideo = videosData[0];
  const youtubeChannelId = firstVideo?.snippet?.videoOwnerChannelId || "unknown";
  const channelName =
    firstVideo?.snippet?.videoOwnerChannelTitle ||
    firstVideo?.snippet?.channelTitle ||
    "Canal";

  const slug = await gerarSlugUnico(playlistData.snippet.title);

  const videosValidos = videosData.filter(
    (item: any) => !isVideoPrivado(item.snippet.title)
  );

  // Tudo dentro de uma transaction — se qualquer passo falhar, reverte tudo
  return await prisma.$transaction(async (tx) => {
    let canal = await tx.canal.findUnique({ where: { youtubeChannelId } });

    if (!canal) {
      canal = await tx.canal.create({
        data: {
          youtubeChannelId,
          nome: channelName,
          descricao: "",
          thumbnailUrl: playlistData.snippet.thumbnails.high?.url,
        },
      });
    }

    // Ordem calculada DENTRO da categoria
    const ultimaDaCategoria = await tx.trilha.findFirst({
      where: { categoriaId },
      orderBy: { ordem: "desc" },
      select: { ordem: true },
    });

    const proximaOrdem = (ultimaDaCategoria?.ordem ?? -1) + 1;

    const trilha = await tx.trilha.create({
      data: {
        titulo: playlistData.snippet.title,
        descricao: playlistData.snippet.description,
        thumbnailUrl: playlistData.snippet.thumbnails.high?.url,
        youtubePlaylistId: playlistId,
        slug,
        categoriaId,
        canalId: canal.id,
        isCurated: true,
        ordem: proximaOrdem,
      },
    });

    for (let i = 0; i < videosValidos.length; i++) {
      const item = videosValidos[i];
      const videoId = item.snippet.resourceId.videoId;

      let video = await tx.video.findUnique({
        where: { youtubeVideoId: videoId },
      });

      if (!video) {
        video = await tx.video.create({
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

      const relationExists = await tx.trilhaVideo.findFirst({
        where: { trilhaId: trilha.id, videoId: video.id },
      });

      if (!relationExists) {
        await tx.trilhaVideo.create({
          data: {
            trilhaId: trilha.id,
            videoId: video.id,
            ordem: i + 1,
          },
        });
      }
    }

    return trilha;
  });
}

// ─── Listagem pública ────────────────────────────────────────────────────

export async function listarTrilhasService() {
  return prisma.trilha.findMany({
    where: { ativa: true },
    include: {
      categoria: { select: { id: true, nome: true, ordem: true } },
      canal: true,
      videos: true,
    },
    orderBy: [
      { categoria: { ordem: "asc" } },
      { ordem: "asc" },
    ],
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
              canal: { select: { nome: true } },
            },
          },
        },
        orderBy: { ordem: "asc" },
      },
    },
  });

  if (!trilha) return null;

  return {
    ...trilha,
    videos: trilha.videos.filter((tv) => !isVideoPrivado(tv.video.titulo)),
  };
}