import { PrismaClient } from '@prisma/client';

export const usersResolver = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany();

  const promises = users.map(async (user) => {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const posts = await prisma.post.findMany({ where: { authorId: user.id } });
    return {
      ...user,
      profile: { ...profile, memberType: { id: profile?.memberTypeId } },
      posts,
    };
  });

  try {
    const users = await Promise.all(promises);
    return users;
  } catch (error) {
    console.log('ERROR - users resolver');
  }
};