import { AUTHORITY_PLATFORMS, AUTHORITY_TYPES, SNAPSHOT_API_URLS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { gql, GraphQLClient } from 'graphql-request';
import { concat, eq, filter, flatMap, get, includes, isEmpty, isEqual, toNumber, uniqWith } from 'lodash';
import { Authority, SnapshotSpace, SnapshotStrategy, SupportedChains } from 'types';

export const SNAPSHOT_QUERY = gql`
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

/**
 * GraphQL client for Snapshot GraphQL API. Mainnet and testnets are different API endpoints, though most networks use the mainnet endpoint.
 * @param chainId - chainId to use for the client
 * @returns GraphQL client
 */
export const snapshotClient = async (chainId: SupportedChains | undefined) => {
  if (!chainId) return undefined;
  const client = new GraphQLClient(SNAPSHOT_API_URLS[chainId]);
  return client as GraphQLClient;
};

export const fetchSnapshotSpaces = async (chainId: SupportedChains | undefined, spaces?: string[]) => {
  if (isEmpty(spaces) || !chainId) {
    return [];
  }
  const client = await snapshotClient(chainId);
  const response: { spaces: SnapshotSpace[] } | undefined = await client?.request(SNAPSHOT_QUERY, { ids: spaces });

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
  const paramValue = get(strategy.params, param);
  if (type === 'array') {
    if (toNumber(get(strategy, 'network')) !== chainId) return false;
    if (includes(paramValue, hatId)) return true;
    if (includes(paramValue, hatIdHexToDecimal(hatId))) return true;
    if (includes(paramValue, hatIdDecimalToIp(BigInt(hatId)))) return true;
    return false;
  }

  if (toNumber(get(strategy, 'network')) !== chainId) return false;
  if (eq(paramValue, hatId)) return true;
  if (eq(paramValue, hatIdHexToDecimal(hatId))) return true;
  if (eq(paramValue, hatIdDecimalToIp(BigInt(hatId)))) return true;
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
  const paramValue = get(strategy.params, param);

  if (toNumber(get(strategy, 'network')) !== chainId) return false;
  if (eq(paramValue, treeId)) return true;
  return false;
};

export const filterStrategies = (
  strategies: SnapshotStrategy[],
  hatId: string | undefined,
  chainId: number | undefined,
) => {
  if (!hatId || !chainId || isEmpty(strategies)) {
    return [];
  }

  // hatId is included in the params.ids array
  const standardIdStrategies = filter(strategies, (strategy: SnapshotStrategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'id', type: 'id' }),
  );
  // hatId is the params.tokenId value
  const standardTokenIdStrategies = filter(strategies, (strategy: SnapshotStrategy) =>
    processStrategy({
      strategy,
      chainId,
      hatId,
      param: 'tokenId',
      type: 'id',
    }),
  );
  // hatId is the params.hatId value
  const hatIdStrategies = filter(strategies, (strategy: SnapshotStrategy) =>
    processStrategy({ strategy, chainId, hatId, param: 'hatId', type: 'id' }),
  );
  // hatId is included in the params.hatIds array
  const hatIdsStrategies = filter(strategies, (strategy: SnapshotStrategy) =>
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
  const treeIdStrategies = filter(strategies, (strategy: SnapshotStrategy) =>
    processStrategyForTree({
      strategy,
      chainId,
      treeId,
      param: 'humanReadableTreeId',
    }),
  );

  // concatenate filtered groups and remove any duplicates
  return uniqWith(
    concat(standardIdStrategies, standardTokenIdStrategies, hatIdStrategies, hatIdsStrategies, treeIdStrategies),
    isEqual,
  );
};

export const processSnapshotSpacesForHat = ({
  spaces,
  hatId,
  chainId,
}: {
  spaces: SnapshotSpace[] | undefined;
  hatId: string | undefined;
  chainId: SupportedChains | undefined;
}): Authority[] | undefined => {
  if (!spaces || !hatId || !chainId) return [];

  return flatMap(spaces, (space: SnapshotSpace) => {
    const filteredStrategies = filterStrategies(space.strategies, hatId, chainId);

    if (isEmpty(filteredStrategies)) return null;

    return {
      label: space.name,
      link: `https://snapshot.org/#/${space.id}`, // ideally could link to active/recent proposal for vote "action"
      gate: `https://snapshot.org/#/${space.id}`,
      description: space.about,
      icon: AUTHORITY_PLATFORMS.snapshot.icon,
      type: AUTHORITY_TYPES.gate,
      id: 'snapshot', // TODO is this ID being used? for key? should be unique
      strategies: filteredStrategies,
    } as Authority;
  }) as Authority[];
};
