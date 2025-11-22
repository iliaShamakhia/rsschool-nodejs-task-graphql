import { PrismaClient } from '@prisma/client';

export const postsResolver = async (prisma: PrismaClient) => await prisma.post.findMany();