import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import { mapValues } from 'lodash';
import { SupportedChains } from 'types';

const NETWORK_ENDPOINT = 'https://gateway-arbitrum.network.thegraph.com/api';
const STUDIO_ENDPOINT = 'https://api.studio.thegraph.com';
const STUDIO_ID = '55784';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;
const graphNetworkUrl = (id: string) => {
  return `${NETWORK_ENDPOINT}/${SUBGRAPH_KEY}/subgraphs/id/${id}`;
};
const studioUrl = (name: string, version: string) => {
  return `${STUDIO_ENDPOINT}/query/${STUDIO_ID}/${name}/${version}`;
};

const LOCAL_NETWORK_ENDPOINTS: { [key in SupportedChains]: string } = {
  // network
  1: graphNetworkUrl('AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx'),
  100: graphNetworkUrl('2VPQUuAeS9Xy8VtinpjHRJEMnZS1sqzFQyCHAys1wb5n'),
  137: graphNetworkUrl('7MxsRb1p4UQNET8AgrWd93h3GUgeQ7NWrk5SHLEPCxBP'),
  42161: graphNetworkUrl('4CiXQPjzKshBbyK2dgJiknTNWcj8cGUJsopTsXfm5HEk'),
  10: graphNetworkUrl('9nmXXk3ysDVY4sFygWQNQknwiJLCPnrUNzDRw8bxw61q'),
  42220: graphNetworkUrl('GpKseh3Z4nX2X8W5HjQPp5hpSSxPxsaQ3t1KpEjhvz7t'),
  8453: graphNetworkUrl('FWeAqrp36QYqv9gDWLwr7em8vtvPnPrmRRQgnBb6QbBs'),
  // studio
  11155111: studioUrl('hats-v1-sepolia', 'v1.1.0'),
};

export const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  ...mapValues(LOCAL_NETWORK_ENDPOINTS, (endpoint: string) => ({ endpoint })),
};

export const ANCILLARY_API_URL: {
  [key in SupportedChains]: string | undefined;
} = {
  1: studioUrl('hats-v1-ethereum-ancillary', 'v0.0.27'),
  10: studioUrl('hats-v1-optimism-ancillary', 'v0.0.24'),
  100: studioUrl('hats-v1-gnosis-chain-ancillary', 'v0.0.24'),
  137: studioUrl('hats-v1-polygon-ancillary', 'v0.0.24'),
  8453: studioUrl('hats-v1-base-ancillary', 'v0.0.25'),
  42161: studioUrl('hats-v1-arbitrum-ancillary', 'v0.0.24'),
  42220: studioUrl('hats-v1-celo-ancillary', 'v0.0.25'),
  11155111: studioUrl('hats-v1-sepolia-ancillary', 'v0.0.25'),
};
