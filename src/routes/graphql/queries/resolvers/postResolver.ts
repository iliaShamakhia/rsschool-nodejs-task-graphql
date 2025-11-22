import { PrismaClient } from '@prisma/client';

export const postResolver = async (args: Record<string, any>, prisma: PrismaClient) => {
  return await prisma.post.findUnique({ where: { id: args.id } });
};