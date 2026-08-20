import { prisma } from "../config/prisma";

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,

      profile: {
        select: {
          id: true,
          telefone: true,
          dataNascimento: true,
          cidade: true,
          estado: true,
          escolaridade: true,
          situacaoProfissional: true,
          objetivoPrincipal: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
  }
) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function upsertUserProfile(
  userId: string,
  data: {
    telefone?: string | null;
    dataNascimento?: Date | null;
    cidade?: string | null;
    estado?: string | null;
    escolaridade?: string | null;
    situacaoProfissional?: string | null;
    objetivoPrincipal?: string | null;
  }
) {
  return prisma.userProfile.upsert({
    where: {
      userId,
    },

    create: {
      userId,
      ...data,
    },

    update: {
      ...data,
    },

    select: {
      id: true,
      telefone: true,
      dataNascimento: true,
      cidade: true,
      estado: true,
      escolaridade: true,
      situacaoProfissional: true,
      objetivoPrincipal: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}