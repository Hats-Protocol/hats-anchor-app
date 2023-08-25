import { GraphQLClient } from 'graphql-request';

const subgraphUrl = (chainId: number) => {
  const clients: { [key: number]: string } = {
    1: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-ethereum',
    5: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-goerli',
    10: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-optimism',
    100: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-gnosis-chain',
    137: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-polygon',
    42161:
      'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-arbitrum',
    11155111:
      'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-sepolia',
  };

  return clients[chainId] || clients[5];
};

const client = (chainId: number) => new GraphQLClient(subgraphUrl(chainId));

export default client;
