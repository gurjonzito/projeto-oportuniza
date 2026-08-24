-- DropForeignKey
ALTER TABLE "trilha_videos" DROP CONSTRAINT "trilha_videos_trilhaId_fkey";

-- DropForeignKey
ALTER TABLE "trilha_videos" DROP CONSTRAINT "trilha_videos_videoId_fkey";

-- CreateTable
CREATE TABLE "user_trilha_progressos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "videosConcluidos" INTEGER NOT NULL DEFAULT 0,
    "percentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "iniciadoEm" TIMESTAMP(3),
    "concluidoEm" TIMESTAMP(3),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_trilha_progressos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_video_progressos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "segundosAssistidos" INTEGER NOT NULL DEFAULT 0,
    "percentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "ultimaVisualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" TIMESTAMP(3),

    CONSTRAINT "user_video_progressos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "modeloIA" TEXT,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "explicacao" TEXT,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" TIMESTAMP(3),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,

    CONSTRAINT "user_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "motivo" TEXT,
    "score" DOUBLE PRECISION,
    "modeloIA" TEXT,
    "objetivoUsuario" TEXT,
    "visualizada" BOOLEAN NOT NULL DEFAULT false,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_trilha_progressos_userId_idx" ON "user_trilha_progressos"("userId");

-- CreateIndex
CREATE INDEX "user_trilha_progressos_trilhaId_idx" ON "user_trilha_progressos"("trilhaId");

-- CreateIndex
CREATE UNIQUE INDEX "user_trilha_progressos_userId_trilhaId_key" ON "user_trilha_progressos"("userId", "trilhaId");

-- CreateIndex
CREATE INDEX "user_video_progressos_userId_idx" ON "user_video_progressos"("userId");

-- CreateIndex
CREATE INDEX "user_video_progressos_videoId_idx" ON "user_video_progressos"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "user_video_progressos_userId_videoId_key" ON "user_video_progressos"("userId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_videoId_key" ON "quizzes"("videoId");

-- CreateIndex
CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");

-- CreateIndex
CREATE INDEX "quiz_options_questionId_idx" ON "quiz_options"("questionId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "user_quiz_answers_attemptId_idx" ON "user_quiz_answers"("attemptId");

-- CreateIndex
CREATE INDEX "user_quiz_answers_questionId_idx" ON "user_quiz_answers"("questionId");

-- CreateIndex
CREATE INDEX "recommendations_userId_idx" ON "recommendations"("userId");

-- CreateIndex
CREATE INDEX "recommendations_trilhaId_idx" ON "recommendations"("trilhaId");

-- CreateIndex
CREATE INDEX "recommendations_userId_criadaEm_idx" ON "recommendations"("userId", "criadaEm");

-- AddForeignKey
ALTER TABLE "trilha_videos" ADD CONSTRAINT "trilha_videos_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "trilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilha_videos" ADD CONSTRAINT "trilha_videos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trilha_progressos" ADD CONSTRAINT "user_trilha_progressos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trilha_progressos" ADD CONSTRAINT "user_trilha_progressos_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "trilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_video_progressos" ADD CONSTRAINT "user_video_progressos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_video_progressos" ADD CONSTRAINT "user_video_progressos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "quiz_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "trilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
