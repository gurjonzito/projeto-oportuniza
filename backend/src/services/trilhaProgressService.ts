import {
  listarTrilhasEmAndamento,
  findTrilhaProgress,
  findTrilhaBySlug,
  createTrilhaProgress,
  updateTrilhaProgressAcesso,
  findVideoProgress,
  createVideoProgress,
  deleteVideoProgress,
} from "../repositories/trilhaProgressRepository";

function mapProgress(progress: any) {
  return {
    slug: progress.trilha.slug,
    titulo: progress.trilha.titulo,

    totalVideos: progress.trilha.videos.length,

    videosConcluidos: progress.videosConcluidos.length,

    videosConcluidosIds: progress.videosConcluidos.map(
      (item: any) => item.video.youtubeVideoId
    ),

    ultimoAcesso: progress.ultimoAcesso.getTime(),
  };
}

export async function listarTrilhasEmAndamentoService(
  userId: string
) {
  const progressos = await listarTrilhasEmAndamento(userId);

  return progressos.map(mapProgress);
}

export async function buscarTrilhaProgressService(
  userId: string,
  slug: string
) {
  const trilha = await findTrilhaBySlug(slug);

  if (!trilha) {
    throw new Error("Trilha não encontrada.");
  }

  const progress = await findTrilhaProgress(
    userId,
    trilha.id
  );

  if (!progress) {
    return undefined;
  }

  return mapProgress(progress);
}

export async function marcarVideoConcluidoService(
  userId: string,
  slug: string,
  youtubeVideoId: string
) {
  const trilha = await findTrilhaBySlug(slug);

  if (!trilha) {
    throw new Error("Trilha não encontrada.");
  }

  const trilhaVideo = trilha.videos.find(
    (item) => item.video.youtubeVideoId === youtubeVideoId
  );

  if (!trilhaVideo) {
    throw new Error(
      "Vídeo não pertence a esta trilha."
    );
  }

  let progress = await findTrilhaProgress(
    userId,
    trilha.id
  );

  if (!progress) {
    await createTrilhaProgress(
      userId,
      trilha.id
    );

    progress = await findTrilhaProgress(
      userId,
      trilha.id
    );
  }

  if (!progress) {
    throw new Error(
      "Não foi possível criar o progresso da trilha."
    );
  }

  const videoProgress = await findVideoProgress(
    progress.id,
    trilhaVideo.videoId
  );

  if (!videoProgress) {
    await createVideoProgress(
      progress.id,
      trilhaVideo.videoId
    );
  }

  await updateTrilhaProgressAcesso(
    progress.id
  );

  const atualizado = await findTrilhaProgress(
    userId,
    trilha.id
  );

  if (!atualizado) {
    throw new Error(
      "Não foi possível recuperar o progresso."
    );
  }

  return mapProgress(atualizado);
}

export async function desmarcarVideoConcluidoService(
  userId: string,
  slug: string,
  youtubeVideoId: string
) {
  const trilha = await findTrilhaBySlug(slug);

  if (!trilha) {
    throw new Error("Trilha não encontrada.");
  }

  const trilhaVideo = trilha.videos.find(
    (item) => item.video.youtubeVideoId === youtubeVideoId
  );

  if (!trilhaVideo) {
    throw new Error(
      "Vídeo não pertence a esta trilha."
    );
  }

  const progress = await findTrilhaProgress(
    userId,
    trilha.id
  );

  if (!progress) {
    throw new Error(
      "Progresso da trilha não encontrado."
    );
  }

  const videoProgress = await findVideoProgress(
    progress.id,
    trilhaVideo.videoId
  );

  if (videoProgress) {
    await deleteVideoProgress(
      progress.id,
      trilhaVideo.videoId
    );
  }

  await updateTrilhaProgressAcesso(
    progress.id
  );

  const atualizado = await findTrilhaProgress(
    userId,
    trilha.id
  );

  if (!atualizado) {
    throw new Error(
      "Não foi possível recuperar o progresso."
    );
  }

  return mapProgress(atualizado);
}