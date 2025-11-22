import { Post, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export const usersResolver = async (
  prisma: PrismaClient,
  profileLoader: DataLoader<string, Profile, string>,
  postsLoader: DataLoader<string, Post[], string>,
) => {
  const users = await prisma.user.findMany();

  const memberTypes = await prisma.memberType.findMany();

  const profileBatch = users.map(async (user) => await profileLoader.load(user.id));
  const postsBatch = users.map(async (user) => await postsLoader.load(user.id));

  const profiles = (await Promise.all(profileBatch)).filter((profile) => profile);

  const profilesWithMemberType = profiles.map((profile) => {
    let memberType: { id: string } | undefined;
    memberType = memberTypes.find((mt) => mt.id === profile.memberTypeId);
    return { ...profile, memberType: { id: memberType?.id } };
  });

  const posts = await Promise.all(postsBatch);

  const subscriptions = await prisma.subscribersOnAuthors.findMany();

  return users.map((user, index) => {
    const userSubscribedTo = subscriptions.filter((s) => s.subscriberId === user.id);
    const subscribedToUser = subscriptions.filter((s) => s.authorId === user.id);
    return {
      ...user,
      userSubscribedTo,
      subscribedToUser,
      profile: profilesWithMemberType[index],
      posts: posts[index],
    };
  });
};