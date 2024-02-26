import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';

const NETWORK_ENDPOINT = 'https://gateway-arbitrum.network.thegraph.com/api';
const HOSTED_SERVICE_ENDPOINT = 'https://api.thegraph.com';
const HOSTED_SERVICE_ORG = 'hats-protocol';
const STUDIO_ENDPOINT = 'https://api.studio.thegraph.com';
const STUDIO_ID = '55784';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;
const graphNetworkUrl = (id: string) => {
  return `${NETWORK_ENDPOINT}/${SUBGRAPH_KEY}/subgraphs/id/${id}`;
};
const hostedServiceUrl = (name: string) => {
  return `${HOSTED_SERVICE_ENDPOINT}/subgraphs/name/${HOSTED_SERVICE_ORG}/${name}`;
};
const studioUrl = (name: string) => {
  return `${STUDIO_ENDPOINT}/query/${STUDIO_ID}/${name}/version/latest`;
};

const LOCAL_NETWORK_ENDPOINTS: { [key in SupportedChains]: string } = {
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
  10: hostedServiceUrl('hats-v1-optimism'),
};

const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  ..._.mapValues(LOCAL_NETWORK_ENDPOINTS, (endpoint: string) => ({ endpoint })),
};

export default NETWORK_ENDPOINTS;

export const ANCILLARY_API_URL: {
  [key in SupportedChains]: string | undefined;
} = {
  1: studioUrl('hats-v1-ethereum-ancillary'),
  10: studioUrl('hats-v1-optimism-ancillary'),
  100: studioUrl('hats-v1-gnosis-chain-ancillary'),
  137: studioUrl('hats-v1-polygon-ancillary'),
  8453: studioUrl('hats-v1-base-ancillary'),
  42161: studioUrl('hats-v1-arbitrum-ancillary'),
  42220: studioUrl('hats-v1-celo-ancillary'),
  11155111: studioUrl('hats-v1-sepolia-ancillary'),
};
