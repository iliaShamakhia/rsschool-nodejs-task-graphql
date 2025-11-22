import { PrismaClient } from '@prisma/client';

export const profilesResolver = async (prisma: PrismaClient) =>
  await prisma.profile.findMany();