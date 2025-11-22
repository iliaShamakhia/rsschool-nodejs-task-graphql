import { Post, PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const postsLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Post[]>(async (userIds) => {
    const userIdsMutable: string[] = [...userIds];
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIdsMutable },
      },
    });

    const postsByUser = new Map<string, Post[]>();
    posts.forEach((post) => {
      const userPosts = postsByUser.get(post.authorId) || [];
      userPosts.push(post);
      postsByUser.set(post.authorId, userPosts);
    });

    const processedPosts = userIds.map((userId) => postsByUser.get(userId) || []);
    return processedPosts;
  });