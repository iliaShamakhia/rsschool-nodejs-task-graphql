import { PrismaClient } from '@prisma/client';
import { ChangePostInputType, CreatePostInputType, PostType } from '../types/postType.js';
import { ChangeProfileInputType, CreateProfileInput, ProfileType } from '../types/profileType.js';
import { ChangeUserInputType, CreateUserInputType, UserType } from '../types/userType.js';
import { GraphQLBoolean, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from '../types/uuid.js';

export const resourcesMutation = (prisma: PrismaClient) => {
  return new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createPost: {
        type: PostType,
        args: {
          dto: { type: CreatePostInputType },
        },
        resolve: async (_, args) => {
          return await prisma.post.create({
            data: args.dto,
          });
        },
      },
      createUser: {
        type: UserType,
        args: {
          dto: { type: CreateUserInputType },
        },
        resolve: async (_, args) => {
          return await prisma.user.create({
            data: args.dto,
          });
        },
      },
      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: CreateProfileInput },
        },
        resolve: async (_, args) => {
          return await prisma.profile.create({
            data: args.dto,
          });
        },
      },
      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedPost = await prisma.post.delete({ where: { id: args.id } });
          return deletedPost ? true : false;
        },
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedProfile = await prisma.profile.delete({ where: { id: args.id } });
          return deletedProfile ? true : false;
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedUser = await prisma.user.delete({ where: { id: args.id } });
          return deletedUser ? true : false;
        },
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangePostInputType },
        },
        resolve: async (_, args) => {
          const updatedPost = await prisma.post.update({
            where: { id: args.id },
            data: args.dto,
          });
          console.log('changePost', { updatedPost });
          return updatedPost;
        },
      },
      changeUser: {
        type: UserType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangeUserInputType },
        },
        resolve: async (_, args) => {
          return await prisma.user.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangeProfileInputType },
        },
        resolve: async (_, args) => {
          return await prisma.profile.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },
      subscribeTo: {
        type: UserType,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType },
        },
        resolve: async (_, args) => {
          await prisma.user.update({
            where: {
              id: args.userId,
            },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
        },
      },

      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const unsubscribed = await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });

          return unsubscribed ? true : false;
        },
      },
    },
  });
};