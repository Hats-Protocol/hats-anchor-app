import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { gql, GraphQLClient } from 'graphql-request';
import _ from 'lodash';

import { AUTHORITY_TYPES } from '@/constants';
import { decimalId } from '@/lib/hats';

type SnapshotApiKeys = 1 | 5 | 10 | 100 | 137 | 424 | 42151;

type SnapshotApiUrls = {
  [key in SnapshotApiKeys]: string;
};

const MAINNET_SNAPSHOT_API_URL = 'https://hub.snapshot.org/graphql';
const SNAPSHOT_API_URLS: SnapshotApiUrls = {
  1: MAINNET_SNAPSHOT_API_URL,
  5: 'https://testnet.hub.snapshot.org/graphql',
  10: MAINNET_SNAPSHOT_API_URL,
  100: MAINNET_SNAPSHOT_API_URL,
  137: MAINNET_SNAPSHOT_API_URL,
  424: MAINNET_SNAPSHOT_API_URL,
  42151: MAINNET_SNAPSHOT_API_URL,
};

const SNAPSHOT_QUERY = gql`
  query GetSpaces($ids: [String!]!) {
    spaces(where: { id_in: $ids }) {
      id
      name
      about
      network
      symbol
      members
      strategies {
        name
        network
        params
      }
    }
  }
`;

interface SnapshotStrategy {
  name: string;
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}

interface SnapshotSpace {
  id: string;
  name: string;
  about: string;
  network: string;
  symbol: string;
  members: number;
  strategies: SnapshotStrategy[];
}

const snapshotClient = async (chainId: number | undefined) => {
  if (!chainId) return undefined;
  const client = new GraphQLClient(
    SNAPSHOT_API_URLS[chainId as SnapshotApiKeys],
  );
  return client;
};

const fetchSnapshotSpaces = async (
  chainId: number | undefined,
  spaces?: string[],
) => {
  if (!spaces || spaces.length === 0 || !chainId) {
    return [];
  }
  const client = await snapshotClient(chainId);
  const response: { spaces: SnapshotSpace[] } | undefined =
    await client?.request(SNAPSHOT_QUERY, { ids: spaces });

  return response?.spaces;
};

const filterStrategies = (
  strategies: SnapshotStrategy[],
  hatId: string | undefined,
  chainId: number | undefined,
) => {
  if (!hatId || !chainId || _.isEmpty(strategies)) {
    return [];
  }

  // generic filter for strategies where the hatId is included in the params.ids array
  const standardIdStrategies = _.filter(
    strategies,
    (strategy) =>
      _.toNumber(strategy.network) === chainId &&
      (_.includes(strategy.params.ids, decimalId(hatId)) ||
        _.includes(strategy.params.ids, hatIdDecimalToIp(BigInt(hatId)))),
  );
  // generic filter for strategies where the hatId is included in the params.tokenId value
  const standardTokenIdStrategies = _.filter(
    strategies,
    (strategy) =>
      _.toNumber(strategy.network) === chainId &&
      (_.eq(strategy.params.tokenId, decimalId(hatId)) ||
        _.eq(strategy.params.tokenId, hatIdDecimalToIp(BigInt(hatId)))),
  );

  // concatenate filtered groups and remove any duplicates
  return _.uniqWith(
    _.concat(standardIdStrategies, standardTokenIdStrategies),
    _.isEqual,
  );
};

const useSnapshotSpaces = ({
  spaces,
  hatId,
  chainId,
  editMode = false,
}: {
  spaces?: string[];
  hatId?: string;
  chainId?: number;
  editMode?: boolean;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['spaces', spaces, chainId],
    queryFn: () => fetchSnapshotSpaces(chainId, spaces),
    enabled: spaces && spaces.length > 0,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const selectedHatSpaceStrategies = data
    ? _.compact(
        _.map(data, (space) => {
          const filteredStrategies = filterStrategies(
            space.strategies,
            hatId,
            chainId,
          );

          return !_.isEmpty(filteredStrategies)
            ? {
                label: space.name,
                link: `https://snapshot.org/#/${space.id}`,
                description: space.about,
                imageUrl: '/img/snapshot.jpeg',
                type: AUTHORITY_TYPES.token,
                id: 'snapshot',
                strategies: filteredStrategies,
              }
            : null;
        }),
      )
    : [];

  return { selectedHatSpaceStrategies, error, loading: isLoading };
};

export default useSnapshotSpaces;
