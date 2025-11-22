import { Post, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

const userOriginalFields = ['id', 'name', 'balance'];

export const usersResolver = async (
  prisma: PrismaClient,
  profileLoader: DataLoader<string, Profile, string>,
  postsLoader: DataLoader<string, Post[], string>,
  fields: Record<string, any>
) => {
  const fieldsKeys = Object.keys(fields);
  console.log({ fieldsKeys });

  const neededFields = Object.fromEntries(
    fieldsKeys
      .filter((field) => !userOriginalFields.includes(field))
      .map((field) => [field, true]),
  );

  let users = await prisma.user.findMany({
    include: neededFields,
  });

  if (fieldsKeys.includes('posts') && fieldsKeys.includes('profile')) {
    const profileBatch = users.map(async (user) => await profileLoader.load(user.id));
    const postsBatch = users.map(async (user) => await postsLoader.load(user.id));

    const profiles = await Promise.all(profileBatch);
    const posts = await Promise.all(postsBatch);

    const memberTypes = await prisma.memberType.findMany();

    const usersResult = users.map((user, index) => {
      return {
        ...user,
        profile: profiles[index],
      };
    });
    return usersResult;
  } else {
    return users;
  }
};