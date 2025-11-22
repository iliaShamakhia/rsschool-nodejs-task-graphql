import { PrismaClient } from '@prisma/client';
import { CreatePostInputType, PostType } from '../types/postType.js';
import { CreateProfileInput, ProfileType } from '../types/profileType.js';
import { CreateUserInput, UserType } from '../types/userType.js';
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
          dto: { type: CreateUserInput },
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
    },
  });
};