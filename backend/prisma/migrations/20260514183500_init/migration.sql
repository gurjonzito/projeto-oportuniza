-- CreateTable
CREATE TABLE "canais" (
    "id" TEXT NOT NULL,
    "youtubeChannelId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "thumbnailUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "thumbnailUrl" TEXT,
    "duracaoSegundos" INTEGER,
    "tags" TEXT[],
    "publicadoEm" TIMESTAMP(3),
    "cachedEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cacheExpiraEm" TIMESTAMP(3),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trilhas" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "nivel" TEXT,
    "thumbnailUrl" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trilhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trilha_videos" (
    "trilhaId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "trilha_videos_pkey" PRIMARY KEY ("trilhaId","videoId")
);

-- CreateTable
CREATE TABLE "buscas_cache" (
    "id" TEXT NOT NULL,
    "termo" TEXT NOT NULL,
    "buscadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3),
    "resultadoIds" TEXT[],

    CONSTRAINT "buscas_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canais_youtubeChannelId_key" ON "canais"("youtubeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "videos_youtubeVideoId_key" ON "videos"("youtubeVideoId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "buscas_cache_termo_key" ON "buscas_cache"("termo");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "canais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilhas" ADD CONSTRAINT "trilhas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilha_videos" ADD CONSTRAINT "trilha_videos_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "trilhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilha_videos" ADD CONSTRAINT "trilha_videos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
