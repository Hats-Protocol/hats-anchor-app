import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_COUNCILS_GRAPHQL_ENDPOINT as string;

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    // Add any necessary headers here
  },
});
