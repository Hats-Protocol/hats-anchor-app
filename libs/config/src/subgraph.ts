import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import { mapValues } from 'lodash';
import { SupportedChains } from 'types';

const STUDIO_ENDPOINT = 'https://api.studio.thegraph.com';
const STUDIO_ID = '55784';
const GATEWAY_URL = 'https://gateway.thegraph.com/api';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;
const gatewayNetworkUrl = (id: string) => {
  return `${GATEWAY_URL}/subgraphs/id/${id}`;
};
const studioUrl = (name: string, version: string) => {
  return `${STUDIO_ENDPOINT}/query/${STUDIO_ID}/${name}/${version}`;
};

const LOCAL_NETWORK_ENDPOINTS: { [key in SupportedChains]: string } = {
  // network
  1: gatewayNetworkUrl('AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx'),
  100: gatewayNetworkUrl('2VPQUuAeS9Xy8VtinpjHRJEMnZS1sqzFQyCHAys1wb5n'),
  137: gatewayNetworkUrl('7MxsRb1p4UQNET8AgrWd93h3GUgeQ7NWrk5SHLEPCxBP'),
  42161: gatewayNetworkUrl('4CiXQPjzKshBbyK2dgJiknTNWcj8cGUJsopTsXfm5HEk'),
  10: gatewayNetworkUrl('9nmXXk3ysDVY4sFygWQNQknwiJLCPnrUNzDRw8bxw61q'),
  42220: gatewayNetworkUrl('GpKseh3Z4nX2X8W5HjQPp5hpSSxPxsaQ3t1KpEjhvz7t'),
  8453: gatewayNetworkUrl('FWeAqrp36QYqv9gDWLwr7em8vtvPnPrmRRQgnBb6QbBs'),
  // testnets
  11155111: gatewayNetworkUrl('GphqDnDUibK3keP5vNSDgnKxidvLKtdM7j9FA1Lpe6sX'),
  84532: studioUrl('hats-v1-base-sepolia', 'v0.0.9'),
};

export const NETWORK_ENDPOINTS: EndpointsConfig = {
  ...DEFAULT_ENDPOINTS_CONFIG,
  ...mapValues(LOCAL_NETWORK_ENDPOINTS, (endpoint: string) => ({
    endpoint,
    authToken: SUBGRAPH_KEY,
  })),
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
  84532: studioUrl('hats-v1-base-sepolia-ancillary', 'v0.0.1'),
};
