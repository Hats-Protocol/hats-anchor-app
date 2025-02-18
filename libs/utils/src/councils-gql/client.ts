import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_COUNCILS_GRAPHQL_ENDPOINT as string;

export const getCouncilsGraphqlClient = (accessToken?: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};
