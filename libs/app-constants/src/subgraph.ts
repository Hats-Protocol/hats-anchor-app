import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';

const NETWORK_ENDPOINT = 'https://gateway-arbitrum.network.thegraph.com/api';
const HOSTED_SERVICE_ENDPOINT = 'https://api.thegraph.com';
const STUDIO_ENDPOINT = 'https://api.studio.thegraph.com';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;
const graphNetworkUrl = (id: string) => {
  return `${NETWORK_ENDPOINT}/${SUBGRAPH_KEY}/subgraphs/id/${id}`;
};
const hostedServiceUrl = (name: string) => {
  return `${HOSTED_SERVICE_ENDPOINT}/subgraphs/name/hats-protocol/${name}`;
};
const studioUrl = (name: string) => {
  return `${STUDIO_ENDPOINT}/query/55784/${name}/version/latest`;
};

const LOCAL_NETWORK_ENDPOINTS = {
  // network
  1: graphNetworkUrl('AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx'),
  100: graphNetworkUrl('2VPQUuAeS9Xy8VtinpjHRJEMnZS1sqzFQyCHAys1wb5n'),
  137: graphNetworkUrl('7MxsRb1p4UQNET8AgrWd93h3GUgeQ7NWrk5SHLEPCxBP'),
  42161: graphNetworkUrl('4CiXQPjzKshBbyK2dgJiknTNWcj8cGUJsopTsXfm5HEk'),
  // studio
  8453: studioUrl('hats-v1-base'),
  42220: studioUrl('hats-v1-celo'),
  11155111: studioUrl('hats-v1-sepolia'),
  // hosted service
  5: hostedServiceUrl('hats-v1-goerli'),
  10: hostedServiceUrl('hats-v1-optimism'),
};

const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  ..._.mapValues(LOCAL_NETWORK_ENDPOINTS, (endpoint) => ({ endpoint })),
};

export default NETWORK_ENDPOINTS;
