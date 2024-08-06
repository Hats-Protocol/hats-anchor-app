import { GraphQLClient } from 'graphql-request';
import { filter, get, isEmpty } from 'lodash';
import { Hex } from 'viem';

const SUPERFLUID_SUBGRAPH_URL: { [key: number]: string } = {
  100: 'https://xdai-mainnet.subgraph.x.superfluid.dev/',
};

const createSuperfluidClient = (chainId: number) => {
  const url = SUPERFLUID_SUBGRAPH_URL[chainId];
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
