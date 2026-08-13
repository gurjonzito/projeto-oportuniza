/*
  Warnings:

  - You are about to drop the `materiais` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "materiais" DROP CONSTRAINT "materiais_trilhaId_fkey";

-- DropTable
DROP TABLE "materiais";

-- CreateTable
CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);
