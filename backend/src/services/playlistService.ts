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

// ─── Helper: garante que um canal existe e devolve ele ────────────────────

async function obterOuCriarCanal(
  tx: any,
  youtubeChannelId: string,
  nome: string,
  thumbnailUrl?: string | null
) {
  let canal = await tx.canal.findUnique({ where: { youtubeChannelId } });

  if (!canal) {
    canal = await tx.canal.create({
      data: {
        youtubeChannelId,
        nome,
        descricao: "",
        thumbnailUrl: thumbnailUrl ?? null,
      },
    });
  }

  return canal;
}

// ─── IMPORTAR ─────────────────────────────────────────────────────────────

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

  const slug = await gerarSlugUnico(playlistData.snippet.title);

  const videosValidos = videosData.filter(
    (item: any) => !isVideoPrivado(item.snippet.title)
  );

  // Canal principal (dono da playlist) — só pra colocar no header da trilha
  const primeiroVideo = videosValidos[0];
  const canalPrincipalYoutubeId =
    primeiroVideo?.snippet?.videoOwnerChannelId ||
    primeiroVideo?.snippet?.channelId ||
    "unknown";
  const canalPrincipalNome =
    primeiroVideo?.snippet?.videoOwnerChannelTitle ||
    primeiroVideo?.snippet?.channelTitle ||
    "Canal";

  return await prisma.$transaction(
    async (tx) => {
      const canalPrincipal = await obterOuCriarCanal(
        tx,
        canalPrincipalYoutubeId,
        canalPrincipalNome,
        playlistData.snippet.thumbnails?.high?.url
      );

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
          thumbnailUrl: playlistData.snippet.thumbnails?.high?.url,
          youtubePlaylistId: playlistId,
          slug,
          categoriaId,
          canalId: canalPrincipal.id,
          isCurated: true,
          ordem: proximaOrdem,
        },
      });

      for (let i = 0; i < videosValidos.length; i++) {
        const item = videosValidos[i];
        const youtubeVideoId = item.snippet.resourceId.videoId;

        // Canal específico DESTE vídeo
        const videoCanalYoutubeId =
          item.snippet.videoOwnerChannelId ||
          item.snippet.channelId ||
          canalPrincipalYoutubeId;

        const videoCanalNome =
          item.snippet.videoOwnerChannelTitle ||
          item.snippet.channelTitle ||
          canalPrincipalNome;

        const canalDoVideo = await obterOuCriarCanal(
          tx,
          videoCanalYoutubeId,
          videoCanalNome
        );

        let video = await tx.video.findUnique({
          where: { youtubeVideoId },
        });

        if (!video) {
          video = await tx.video.create({
            data: {
              youtubeVideoId,
              titulo: item.snippet.title,
              descricao: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url,
              canalId: canalDoVideo.id,
              tags: [],
              isCurated: true,
            },
          });
        } else {
          // Corrige canal se já existia com o valor errado
          video = await tx.video.update({
            where: { id: video.id },
            data: {
              titulo: item.snippet.title,
              descricao: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url,
              canalId: canalDoVideo.id,
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
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
}

// ─── SINCRONIZAR UMA TRILHA ───────────────────────────────────────────────

export async function sincronizarPlaylistService(trilhaId: string) {
  const trilha = await prisma.trilha.findUnique({
    where: { id: trilhaId },
  });

  if (!trilha) throw new Error("Trilha não encontrada");
  if (!trilha.youtubePlaylistId) {
    throw new Error("Esta trilha não está vinculada a uma playlist do YouTube");
  }

  const [playlistData, videosData] = await Promise.all([
    buscarPlaylist(trilha.youtubePlaylistId),
    buscarVideosPlaylist(trilha.youtubePlaylistId),
  ]);

  const videosValidos = videosData.filter(
    (item: any) => !isVideoPrivado(item.snippet.title)
  );

  const primeiroVideo = videosValidos[0];
  const canalPrincipalYoutubeId =
    primeiroVideo?.snippet?.videoOwnerChannelId ||
    primeiroVideo?.snippet?.channelId ||
    "unknown";
  const canalPrincipalNome =
    primeiroVideo?.snippet?.videoOwnerChannelTitle ||
    primeiroVideo?.snippet?.channelTitle ||
    "Canal";

  return await prisma.$transaction(
    async (tx) => {
      // 1. Garantir canal principal
      await obterOuCriarCanal(
        tx,
        canalPrincipalYoutubeId,
        canalPrincipalNome,
        playlistData.snippet.thumbnails?.high?.url
      );

      // 2. Atualizar metadados da trilha
      await tx.trilha.update({
        where: { id: trilha.id },
        data: {
          titulo: playlistData.snippet.title,
          descricao: playlistData.snippet.description,
          thumbnailUrl: playlistData.snippet.thumbnails?.high?.url,
        },
      });

      // 3. Relações atuais
      const relacoesAtuais = await tx.trilhaVideo.findMany({
        where: { trilhaId: trilha.id },
        include: {
          video: { select: { id: true, youtubeVideoId: true } },
        },
      });

      const youtubeIdsAtuais = new Set<string>(
        videosValidos.map((v: any) => v.snippet.resourceId.videoId)
      );

      // 4. Remover relações cujo vídeo saiu da playlist
      const relacoesParaRemover = relacoesAtuais.filter(
        (r) => !youtubeIdsAtuais.has(r.video.youtubeVideoId)
      );

      if (relacoesParaRemover.length > 0) {
        await tx.trilhaVideo.deleteMany({
          where: {
            trilhaId: trilha.id,
            videoId: { in: relacoesParaRemover.map((r) => r.video.id) },
          },
        });
      }

      // 5. Upsert na ordem atual do YouTube
      let adicionados = 0;
      let atualizados = 0;

      for (let i = 0; i < videosValidos.length; i++) {
        const item = videosValidos[i];
        const youtubeVideoId = item.snippet.resourceId.videoId;

        // Canal específico DESTE vídeo
        const videoCanalYoutubeId =
          item.snippet.videoOwnerChannelId ||
          item.snippet.channelId ||
          canalPrincipalYoutubeId;

        const videoCanalNome =
          item.snippet.videoOwnerChannelTitle ||
          item.snippet.channelTitle ||
          canalPrincipalNome;

        const canalDoVideo = await obterOuCriarCanal(
          tx,
          videoCanalYoutubeId,
          videoCanalNome
        );

        const videoExistente = await tx.video.findUnique({
          where: { youtubeVideoId },
        });

        let video;
        if (!videoExistente) {
          video = await tx.video.create({
            data: {
              youtubeVideoId,
              titulo: item.snippet.title,
              descricao: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url,
              canalId: canalDoVideo.id,
              tags: [],
              isCurated: true,
            },
          });
          adicionados++;
        } else {
          video = await tx.video.update({
            where: { id: videoExistente.id },
            data: {
              titulo: item.snippet.title,
              descricao: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails?.high?.url,
              canalId: canalDoVideo.id,
            },
          });
          atualizados++;
        }

        await tx.trilhaVideo.upsert({
          where: {
            trilhaId_videoId: {
              trilhaId: trilha.id,
              videoId: video.id,
            },
          },
          update: { ordem: i + 1 },
          create: {
            trilhaId: trilha.id,
            videoId: video.id,
            ordem: i + 1,
          },
        });
      }

      return {
        ok: true,
        adicionados,
        atualizados,
        removidos: relacoesParaRemover.length,
        total: videosValidos.length,
      };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
}

// ─── Listagem pública ────────────────────────────────────────────────────

export async function listarTrilhasService() {
  return prisma.trilha.findMany({
    where: { ativa: true },
    include: {
      categoria: { select: { id: true, nome: true, ordem: true } },
      canal: true,
      videos: {
        include: {
          video: {
            include: {
              canal: {
                select: { id: true, nome: true, thumbnailUrl: true },
              },
            },
          },
        },
        orderBy: { ordem: "asc" },
      },
    },
    orderBy: [{ categoria: { ordem: "asc" } }, { ordem: "asc" }],
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
              canal: { select: { id: true, nome: true, thumbnailUrl: true } },
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