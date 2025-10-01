import type { EndpointsConfig } from '@hatsprotocol/sdk-v1-subgraph';
import { DEFAULT_ENDPOINTS_CONFIG } from '@hatsprotocol/sdk-v1-subgraph';
import { mapValues } from 'lodash';
import { SupportedChains } from 'types';

const GATEWAY_URL = 'https://gateway.thegraph.com/api';

const SUBGRAPH_KEY = process.env.NEXT_PUBLIC_SUBGRAPH_NETWORK_KEY;
const gatewayNetworkUrl = (id: string) => {
  return `${GATEWAY_URL}/subgraphs/id/${id}`;
};

const LOCAL_NETWORK_ENDPOINTS: { [key in SupportedChains]: string } = {
  // network
  1: gatewayNetworkUrl('AtrhAMCcVfPbmejxTez3G59Kdfu5tMFoiPsTUjdCzpKx'),
  10: gatewayNetworkUrl('9nmXXk3ysDVY4sFygWQNQknwiJLCPnrUNzDRw8bxw61q'),
  100: gatewayNetworkUrl('2VPQUuAeS9Xy8VtinpjHRJEMnZS1sqzFQyCHAys1wb5n'),
  137: gatewayNetworkUrl('7MxsRb1p4UQNET8AgrWd93h3GUgeQ7NWrk5SHLEPCxBP'),
  8453: gatewayNetworkUrl('FWeAqrp36QYqv9gDWLwr7em8vtvPnPrmRRQgnBb6QbBs'),
  42161: gatewayNetworkUrl('4CiXQPjzKshBbyK2dgJiknTNWcj8cGUJsopTsXfm5HEk'),
  42220: gatewayNetworkUrl('GpKseh3Z4nX2X8W5HjQPp5hpSSxPxsaQ3t1KpEjhvz7t'),
  // testnets
  84532: gatewayNetworkUrl('ErLvK6LwwsxkRqd8jvDJ258qfxn1hXhjFGnX78rq1g45'),
  11155111: gatewayNetworkUrl('GphqDnDUibK3keP5vNSDgnKxidvLKtdM7j9FA1Lpe6sX'),
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
  1: gatewayNetworkUrl('8PFNN7v8dM9ivLkK33GmxrN9KvQdzj6pPXtnjyPhp3Vz'),
  10: gatewayNetworkUrl('E4cKJKsrjUgXSwdYZiY2qr6iapiJtzAmvJPNhzB3ZXaU'),
  100: gatewayNetworkUrl('BW77GmitrJ1fpcQxCh8pD1ByZsYA9RYaTxkb7eQGVUpP'),
  137: gatewayNetworkUrl('2sgSZBBCoHCJwxHedJ9StP3TfCeWreL7qPKsvNKHCFQ4'),
  8453: gatewayNetworkUrl('7jZgRG7Jq82Fb1u8jyp5ssMUKBArS2awB5Ntuvr1SG19'),
  42161: gatewayNetworkUrl('4LLNyDawRxMNeEpnwo2FcZ5cjjt9p6R9QxEK6w1o4xQj'),
  42220: gatewayNetworkUrl('CRNjnuoxfimapENXiGezHbSoBftKqF3ZnUhqZLaqVXQk'),
  // testnets
  84532: gatewayNetworkUrl('J31xpBbw6ydicVAi1wXr5eJpWHVDdeDdk3JZGrxtW7MC'),
  11155111: gatewayNetworkUrl('CtSNCVK4g2chmnMy29s2FCq14Rup4U9EUDwpQ2NNCPC9'),
};
