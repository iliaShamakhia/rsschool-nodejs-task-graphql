import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { ExecutionResult, graphql, GraphQLSchema, parse, Source, validate } from 'graphql';
import { resourcesQuery } from './queries/allResourcesQuery.js';
import { resourcesMutation } from './mutations/allResourcesMutation.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const getAllResourcesSchema = new GraphQLSchema({
    query: resourcesQuery(prisma),
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

      const validationErrors = validate(
        getAllResourcesSchema,
        parse(new Source(req.body.query)),
        [depthLimit(5)],
      );

      if (validationErrors.length) {
        return { errors: validationErrors } as ExecutionResult;
      }

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
