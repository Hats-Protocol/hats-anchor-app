import { GraphQLClient } from 'graphql-request';

// TODO need mainnet subgraph
const subgraphUrl = (chainId) => {
  const clients = {
    // 1: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-mainnet',
    5: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-goerli',
    100: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-gnosis-chain',
    137: 'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-polygon',
  };

  return clients[chainId] || clients[5];
};

const client = (chainId) => new GraphQLClient(subgraphUrl(chainId));

export default client;
