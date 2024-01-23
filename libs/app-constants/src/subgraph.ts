import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;

const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  1: {
    endpoint: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx`,
  },
  5: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-goerli',
  },
  10: {
    endpoint:
      'https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-optimism',
  },
  100: {
    endpoint: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/2VPQUuAeS9Xy8VtinpjHRJEMnZS1sqzFQyCHAys1wb5n`,
  },
  137: {
    endpoint: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/7MxsRb1p4UQNET8AgrWd93h3GUgeQ7NWrk5SHLEPCxBP`,
  },
  424: {
    endpoint:
      'https://api.goldsky.com/api/public/project_clp1niaem0pe001qjhju6b9sz/subgraphs/hats-v1-pgn/1.0.0/gn',
  },
  8453: {
    endpoint: `https://api.studio.thegraph.com/query/55784/hats-v1-base/version/latest`,
  },
  42161: {
    endpoint: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/4CiXQPjzKshBbyK2dgJiknTNWcj8cGUJsopTsXfm5HEk`,
  },
  42220: {
    endpoint:
      'https://api.studio.thegraph.com/query/55784/hats-v1-celo/version/latest',
  },
  11155111: {
    endpoint:
      'https://api.studio.thegraph.com/query/55784/hats-v1-sepolia/version/latest',
  },
};

export default NETWORK_ENDPOINTS;
