import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;

const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  1: {
    endpoint: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx`,
  },
};

export default NETWORK_ENDPOINTS;
