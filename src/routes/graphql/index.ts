import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { ExecutionResult, graphql, GraphQLSchema, parse, Source, validate } from 'graphql';
import { resourcesQuery } from './queries/allResourcesQuery.js';
import { resourcesMutation } from './mutations/allResourcesMutation.js';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';
import { Post, Profile } from '@prisma/client';
import { profileLoader } from './loaders/profileLoader.js';
import { postsLoader } from './loaders/postsLoader.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const getAllResourcesSchema = (
    profileLoader: DataLoader<string, Profile, string>,
    postsLoader: DataLoader<string, Post[], string>,
  ) => new GraphQLSchema({
    query: resourcesQuery(prisma, profileLoader, postsLoader),
    mutation: resourcesMutation(prisma),
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

      const allResourcesSchema = getAllResourcesSchema(profileLoader(prisma), postsLoader(prisma));

      const validationErrors = validate(
        allResourcesSchema,
        parse(new Source(req.body.query)),
        [depthLimit(5)],
      );

      if (validationErrors.length) {
        return { errors: validationErrors } as ExecutionResult;
      }

      const result = await graphql({
        schema: allResourcesSchema,
        source: query,
        variableValues: variables,
      });
      return result;
    },
  });
};

export default plugin;
