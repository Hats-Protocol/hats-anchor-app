import {
  AUTHORITY_PLATFORMS,
  AUTHORITY_TYPES,
  SNAPSHOT_API_URLS,
} from '@hatsprotocol/constants';
import {
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdToTreeId,
} from '@hatsprotocol/sdk-v1-core';
import { gql, GraphQLClient } from 'graphql-request';
import _ from 'lodash';
import {
  Authority,
  SnapshotSpace,
  SnapshotStrategy,
  SupportedChains,
} from 'types';

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

export const snapshotClient = async (chainId: SupportedChains | undefined) => {
  if (!chainId) return undefined;
  const client = new GraphQLClient(SNAPSHOT_API_URLS[chainId]);
  return client;
};

export const fetchSnapshotSpaces = async (
  chainId: SupportedChains | undefined,
  spaces?: string[],
) => {
  if (_.isEmpty(spaces) || !chainId) {
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
    if (_.includes(paramValue, hatIdHexToDecimal(hatId))) return true;
    if (_.includes(paramValue, hatIdDecimalToIp(BigInt(hatId)))) return true;
    return false;
  }

  if (_.toNumber(_.get(strategy, 'network')) !== chainId) return false;
  if (_.eq(paramValue, hatId)) return true;
  if (_.eq(paramValue, hatIdHexToDecimal(hatId))) return true;
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

export const filterStrategies = (
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

  return _.flatMap(spaces, (space: SnapshotSpace) => {
    const filteredStrategies = filterStrategies(
      space.strategies,
      hatId,
      chainId,
    );

    if (_.isEmpty(filteredStrategies)) return null;

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
