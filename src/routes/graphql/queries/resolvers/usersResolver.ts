import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const usersResolver = async (prisma: PrismaClient) => {
  const profileLoader = new DataLoader<string, any>(async (userIds) => {
    const userIdsMutable: string[] = [...userIds];

    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: userIdsMutable },
      },
    });

    const profileMap = new Map<string, any>();
    profiles.forEach((profile) => {
      profileMap.set(profile.userId, profile);
    });

    return userIds.map((userId) => profileMap.get(userId));
  });

  const postsLoader = new DataLoader<string, any[]>(async (userIds) => {
    const userIdsMutable: string[] = [...userIds];
    
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIdsMutable },
      },
    });

    const postsByUser = new Map<string, any[]>();
      posts.forEach((post) => {
        const userPosts = postsByUser.get(post.authorId) || [];
        userPosts.push(post);
        postsByUser.set(post.authorId, userPosts);
      });

    return userIds.map((userId) => postsByUser.get(userId) || []);
  });

  const users = await prisma.user.findMany();
  await prisma.memberType.findMany();

  const profileBatch = users.map((user) => profileLoader.load(user.id));
  const postsBatch = users.map((user) => postsLoader.load(user.id));

  const profiles = await Promise.all(profileBatch);
  const posts = await Promise.all(postsBatch);

  const result = users.map((user, index) => ({
    ...user,
    profile: { ...profiles[index], memberType: { id: profiles[index].memberTypeId } },
    posts: posts[index],
  }));

  return result;
};