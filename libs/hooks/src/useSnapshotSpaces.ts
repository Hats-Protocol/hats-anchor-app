import {
  AUTHORITY_PLATFORMS,
  AUTHORITY_TYPES,
  SNAPSHOT_API_URLS,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { gql, GraphQLClient } from 'graphql-request';
import { SnapshotSpace, SnapshotStrategy, SupportedChains } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';

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

const snapshotClient = async (chainId: SupportedChains | undefined) => {
  if (!chainId) return undefined;
  const client = new GraphQLClient(SNAPSHOT_API_URLS[chainId]);
  return client;
};

const fetchSnapshotSpaces = async (
  chainId: SupportedChains | undefined,
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
  const standardIdStrategies = _.filter(
    strategies,
    (strategy: SnapshotStrategy) =>
      processStrategy({ strategy, chainId, hatId, param: 'id', type: 'id' }),
  );
  // hatId is the params.tokenId value
  const standardTokenIdStrategies = _.filter(
    strategies,
    (strategy: SnapshotStrategy) =>
      processStrategy({
        strategy,
        chainId,
        hatId,
        param: 'tokenId',
        type: 'id',
      }),
  );
  // hatId is the params.hatId value
  const hatIdStrategies = _.filter(strategies, (strategy: SnapshotStrategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'hatId', type: 'id' }),
  );
  // hatId is included in the params.hatIds array
  const hatIdsStrategies = _.filter(strategies, (strategy: SnapshotStrategy) =>
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
  const treeIdStrategies = _.filter(strategies, (strategy: SnapshotStrategy) =>
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
  chainId?: SupportedChains;
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
        _.map(data, (space: SnapshotSpace) => {
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
                imageUrl: AUTHORITY_PLATFORMS.snapshot.icon,
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
