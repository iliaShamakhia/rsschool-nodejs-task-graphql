import { PrismaClient } from '@prisma/client';

export const profileResolver = async (
  args: Record<string, any>,
  prisma: PrismaClient,
) => {
  return await prisma.profile.findUnique({ where: { id: args.id } });
};