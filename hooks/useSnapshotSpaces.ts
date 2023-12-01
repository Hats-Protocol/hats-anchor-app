import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { gql, GraphQLClient } from 'graphql-request';
import _ from 'lodash';

import { AUTHORITY_TYPES, GUILD_PLATFORMS } from '@/constants';
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

export interface SnapshotStrategy {
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

const processStrategy = ({
  strategy,
  param,
  type,
  chainId,
  hatId,
}: {
  strategy: SnapshotStrategy;
  param: string;
  type: 'array' | 'id';
  chainId: number;
  hatId: string;
}) => {
  const paramValue = _.get(strategy.params, param);
  if (type === 'array') {
    if (_.toNumber(_.get(strategy, 'network')) !== chainId) return false;
    if (_.includes(paramValue, hatId)) return true;
    if (_.includes(paramValue, decimalId(hatId))) return true;
    if (_.includes(paramValue, hatIdDecimalToIp(BigInt(hatId)))) return true;
    return false;
  }

  if (_.toNumber(_.get(strategy, 'network')) !== chainId) return false;
  if (_.eq(paramValue, hatId)) return true;
  if (_.eq(paramValue, decimalId(hatId))) return true;
  if (_.eq(paramValue, hatIdDecimalToIp(BigInt(hatId)))) return true;
  return false;
};

const processStrategyForTree = ({
  strategy,
  param,
  // type,
  chainId,
  treeId,
}: {
  strategy: SnapshotStrategy;
  param: string;
  // type: 'array' | 'id';
  chainId: number;
  treeId: number;
}) => {
  const paramValue = _.get(strategy.params, param);

  if (_.toNumber(_.get(strategy, 'network')) !== chainId) return false;
  if (_.eq(paramValue, treeId)) return true;
  return false;
};

const filterStrategies = (
  strategies: SnapshotStrategy[],
  hatId: string | undefined,
  chainId: number | undefined,
) => {
  if (!hatId || !chainId || _.isEmpty(strategies)) {
    return [];
  }

  // hatId is included in the params.ids array
  const standardIdStrategies = _.filter(strategies, (strategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'id', type: 'id' }),
  );
  // hatId is the params.tokenId value
  const standardTokenIdStrategies = _.filter(strategies, (strategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'tokenId', type: 'id' }),
  );
  // hatId is the params.hatId value
  const hatIdStrategies = _.filter(strategies, (strategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'hatId', type: 'id' }),
  );
  // hatId is included in the params.hatIds array
  const hatIdsStrategies = _.filter(strategies, (strategy) =>
    processStrategy({
      strategy,
      chainId,
      hatId,
      param: 'hatIds',
      type: 'array',
    }),
  );
  // treeId is the params.humanReadableTreeId value
  const treeId = hatIdToTreeId(BigInt(hatId));
  const treeIdStrategies = _.filter(strategies, (strategy) =>
    processStrategyForTree({
      strategy,
      chainId,
      treeId,
      param: 'humanReadableTreeId',
    }),
  );

  // concatenate filtered groups and remove any duplicates
  return _.uniqWith(
    _.concat(
      standardIdStrategies,
      standardTokenIdStrategies,
      hatIdStrategies,
      hatIdsStrategies,
      treeIdStrategies,
    ),
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

  const selectedHatSpaces = data
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
                gate: `https://snapshot.org`,
                description: space.about,
                imageUrl: GUILD_PLATFORMS.snapshot.icon,
                type: AUTHORITY_TYPES.gate,
                id: 'snapshot',
                strategies: filteredStrategies,
              }
            : null;
        }),
      )
    : [];

  return { selectedHatSpaces, error, loading: isLoading };
};

export default useSnapshotSpaces;
