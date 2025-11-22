import { PrismaClient } from '@prisma/client';

export const memberTypesResolver = async (prisma: PrismaClient) =>
  await prisma.memberType.findMany();