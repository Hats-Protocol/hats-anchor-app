import { GraphQLClient } from 'graphql-request';
import { filter, get, isEmpty } from 'lodash';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

const SUPERFLUID_SUBGRAPH_URL: {
  [key in SupportedChains]: string | undefined;
} = {
  1: 'https://eth-mainnet.subgraph.x.superfluid.dev/',
  10: 'https://optimism-mainnet.subgraph.x.superfluid.dev/',
  100: 'https://xdai-mainnet.subgraph.x.superfluid.dev/',
  137: 'https://polygon-mainnet.subgraph.x.superfluid.dev/',
  8453: 'https://base-mainnet.subgraph.x.superfluid.dev/',
  42161: 'https://arbitrum-mainnet.subgraph.x.superfluid.dev/',
  42220: undefined,

  // 421611: '',
  11155111: 'https://eth-sepolia.subgraph.x.superfluid.dev/',
};

const createSuperfluidClient = (chainId: number) => {
  const url = SUPERFLUID_SUBGRAPH_URL[chainId as SupportedChains];
  if (!url) return null;
  return new GraphQLClient(url);
};

const INBOUND_STREAMS_QUERY = `
  query InboundStreams($addresses: [ID!]) {
    streams(where: {receiver_: {id_in: $addresses}}) {
      receiver {
        id
      }
      sender {
        id
      }
      streamedUntilUpdatedAt
      currentFlowRate
      token {
        id
        name
        symbol
        decimals
      }
    }
  }
`;

export const fetchSuperfluidStreams = async ({
  addresses,
  chainId,
}: {
  addresses: Hex[] | undefined;
  chainId: number | undefined;
}) => {
  if (!chainId || isEmpty(addresses)) return null;

  const client = createSuperfluidClient(chainId);

  if (!client) return null;

  const result = await client.request(INBOUND_STREAMS_QUERY, {
    addresses,
  });
  const streams = get(result, 'streams');
  const activeStreams = filter(
    streams,
    (stream: any) => stream.currentFlowRate > 0,
  );

  return activeStreams;
};
