/*
  Warnings:

  - You are about to drop the column `finalizadoEm` on the `quiz_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `iniciadoEm` on the `quiz_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `totalQuestoes` on the `quiz_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `geradoEm` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `modeloIA` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the `recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_quiz_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_trilha_progressos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_video_progressos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `total` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_trilhaId_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "user_quiz_answers_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "user_quiz_answers_optionId_fkey";

-- DropForeignKey
ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "user_quiz_answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "user_trilha_progressos" DROP CONSTRAINT "user_trilha_progressos_trilhaId_fkey";

-- DropForeignKey
ALTER TABLE "user_trilha_progressos" DROP CONSTRAINT "user_trilha_progressos_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_video_progressos" DROP CONSTRAINT "user_video_progressos_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_video_progressos" DROP CONSTRAINT "user_video_progressos_videoId_fkey";

-- AlterTable
ALTER TABLE "quiz_attempts" DROP COLUMN "finalizadoEm",
DROP COLUMN "iniciadoEm",
DROP COLUMN "totalQuestoes",
ADD COLUMN     "realizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "total" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quiz_options" ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quiz_questions" ALTER COLUMN "ordem" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "ativo",
DROP COLUMN "geradoEm",
DROP COLUMN "modeloIA",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "recommendations";

-- DropTable
DROP TABLE "user_quiz_answers";

-- DropTable
DROP TABLE "user_trilha_progressos";

-- DropTable
DROP TABLE "user_video_progressos";

-- CreateTable
CREATE TABLE "trilhas_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "ultimoAcesso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trilhas_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_progress" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "concluidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "respondidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trilhas_progress_userId_idx" ON "trilhas_progress"("userId");

-- CreateIndex
CREATE INDEX "trilhas_progress_trilhaId_idx" ON "trilhas_progress"("trilhaId");

-- CreateIndex
CREATE UNIQUE INDEX "trilhas_progress_userId_trilhaId_key" ON "trilhas_progress"("userId", "trilhaId");

-- CreateIndex
CREATE INDEX "videos_progress_videoId_idx" ON "videos_progress"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "videos_progress_progressId_videoId_key" ON "videos_progress"("progressId", "videoId");

-- CreateIndex
CREATE INDEX "quiz_answers_questionId_idx" ON "quiz_answers"("questionId");

-- CreateIndex
CREATE INDEX "quiz_answers_optionId_idx" ON "quiz_answers"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_attemptId_questionId_key" ON "quiz_answers"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "trilhas_progress" ADD CONSTRAINT "trilhas_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilhas_progress" ADD CONSTRAINT "trilhas_progress_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "trilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos_progress" ADD CONSTRAINT "videos_progress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "trilhas_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos_progress" ADD CONSTRAINT "videos_progress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "quiz_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
