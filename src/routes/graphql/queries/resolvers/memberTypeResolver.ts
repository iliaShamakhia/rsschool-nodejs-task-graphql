import { PrismaClient } from '@prisma/client';

export const memberTypeResolver = async (
  args: Record<string, any>,
  prisma: PrismaClient,
) => {
  return await prisma.memberType.findUnique({
    where: { id: args.id },
  });
};