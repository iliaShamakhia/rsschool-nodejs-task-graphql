import { PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export const profileLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Profile>(async (userIds) => {
    const userIdsMutable: string[] = [...userIds];

    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: userIdsMutable },
      },
      include: { memberType: true }
    });

    const profileMap = new Map<string, Profile>();
    profiles.forEach((profile) => {
      profileMap.set(profile.userId, profile);
    });

    const processedProfiles = userIds.map((userId) =>
      profileMap.get(userId),
    ) as Profile[];
    return processedProfiles;
  });