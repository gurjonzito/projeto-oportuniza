/*
  Warnings:

  - You are about to drop the column `atualizadoEm` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `criadoEm` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `objetivoProfissional` on the `user_profiles` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "atualizadoEm",
DROP COLUMN "criadoEm",
DROP COLUMN "objetivoProfissional",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "objetivoPrincipal" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
