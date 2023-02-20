import { GraphQLClient } from 'graphql-request';

const subgraphUrl = (chainId) => {
  const clients = {
    // 1: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol',
    5: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-goerli',
  };

  return clients[chainId] || clients[5];
};

const client = (chainId) => new GraphQLClient(subgraphUrl(chainId));

export default client;
