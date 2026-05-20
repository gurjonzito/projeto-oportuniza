import { prisma } from "../config/prisma"

export async function criarTrilha(
  data: any
) {

  return prisma.trilha.create({
    data,
  })
}