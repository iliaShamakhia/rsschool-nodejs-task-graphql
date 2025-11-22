import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { MemberTypeType, MemberTypeIdEnum } from './types/memberType.js';
import { PostType } from './types/postType.js';
import { UserType } from './types/userType.js';
import { ProfileType } from './types/profileType.js';
import { UUIDType } from './types/uuid.js';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { memberTypesResolver } from '../../resolvers/memberTypesResolver.js';
import { postsResolver } from '../../resolvers/postsResolver.js';
import { usersResolver } from '../../resolvers/usersResolver.js';
import { profilesResolver } from '../../resolvers/profilesResolver.js';
import { memberTypeResolver } from '../../resolvers/memberTypeResolver.js';
import { postResolver } from '../../resolvers/postResolver.js';
import { profileResolver } from '../../resolvers/profileResolver.js';
import { userResolver } from '../../resolvers/userResolver.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const getAllResourcesSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'getAllResourcesSchema',
      fields: {
        memberTypes: { type: new GraphQLList(MemberTypeType), resolve: async () => await memberTypesResolver(prisma) },
        posts: { type: new GraphQLList(PostType), resolve: () => async () => await postsResolver(prisma) },
        users: { type: new GraphQLList(UserType), resolve: async () => usersResolver(prisma) },
        profiles: { type: new GraphQLList(ProfileType), resolve: async () => await profilesResolver(prisma) },
        memberType: { 
          type: MemberTypeType,
          args: {
            id: { type: MemberTypeIdEnum },
          },
          resolve: async (_, args) => memberTypeResolver(args, prisma),
        },
        post: {
          type: PostType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => postResolver(args, prisma),
        },
        user: {
          type: UserType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => userResolver(args, prisma),
        },
        profile: {
          type: ProfileType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => profileResolver(args, prisma),
        },
      },
    }),
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema: getAllResourcesSchema,
        source: query,
        variableValues: variables,
      });
      return result;
    },
  });
};

export default plugin;
