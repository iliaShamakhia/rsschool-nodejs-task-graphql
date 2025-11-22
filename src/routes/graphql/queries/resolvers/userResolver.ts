import { PrismaClient } from '@prisma/client';

export const userResolver = async (args: Record<string, any>, prisma: PrismaClient) => {
  const user = await prisma.user.findUnique({ where: { id: args.id } });

  if (!user) {
    return null;
  }

  const subscriptionData = await prisma.subscribersOnAuthors.findMany({
    where: { subscriberId: user?.id },
  });

  let userAsAuthorsForThisUser = await prisma.user.findMany({
    where: {
      id: {
        in: subscriptionData.map((subscription) => subscription.authorId),
      },
    },
  });

  const authorsForThisUser = await Promise.all(
    userAsAuthorsForThisUser.map(async (author) => {
      const authorSubsData = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: author.id },
      });

      const subscribersOfThisAuthor = await prisma.user.findMany({
        where: {
          id: {
            in: authorSubsData.map((subscription) => subscription.subscriberId),
          },
        },
      });

      return { ...author, subscribedToUser: subscribersOfThisAuthor };
    }),
  );

  const userAsAuthorData = await prisma.subscribersOnAuthors.findMany({
    where: { authorId: user?.id },
  });

  const usersAsSubscribersOfThisUser = await prisma.user.findMany({
    where: {
      id: {
        in: userAsAuthorData.map((subscription) => subscription.subscriberId),
      },
    },
  });

  const subscribersOfThisUser = await Promise.all(
    usersAsSubscribersOfThisUser.map(async (subscriber) => {
      const subscriberAuthorsData = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: subscriber.id },
      });

      const authorsForThisSubscriber = await prisma.user.findMany({
        where: {
          id: {
            in: subscriberAuthorsData.map((subscription) => subscription.authorId),
          },
        },
      });

      return { ...subscriber, userSubscribedTo: authorsForThisSubscriber };
    }),
  );

  const profile = await prisma.profile.findUnique({
    where: { userId: user?.id },
  });

  const posts = await prisma.post.findMany({ where: { authorId: user?.id } });

  const userWithProfile = {
    ...user,
    profile: profile ? { ...profile, memberType: { id: profile?.memberTypeId } } : null,
    posts,
    userSubscribedTo: [...authorsForThisUser],
    subscribedToUser: [...subscribersOfThisUser],
  };
  return userWithProfile;
};