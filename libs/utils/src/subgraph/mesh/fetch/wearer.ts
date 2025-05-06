import { Wearer } from '@hatsprotocol/sdk-v1-subgraph';
import { GraphQLClient } from 'graphql-request';
import { get, map, toLower, uniqBy } from 'lodash';
import { mapWithChainId } from 'shared';
import { AppTree } from 'types';
import { Hex } from 'viem';

import { logger } from '../../../logs';
import { stripSuffix } from '../../mesh';
import {
  getCrossChainWearerDetailsQuery,
  getWearerDetailsQuery,
  getWearersProfileDetailQuery,
  getWearerTreesQuery,
  NETWORKS_PREFIX,
} from '../queries';
import { getCrossChainAllowlistEligibilitiesQuery } from '../queries';
import { parseMetadata } from './utils';

export const fetchWearerDetailsMesh = async (address: Hex | string | undefined, chainId: number | undefined) => {
  if (!address || !chainId) return undefined;
  let wearer: Wearer | undefined;

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
    const query = getWearerDetailsQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      id: address.toLowerCase(),
    });

    wearer = res[`${NETWORKS_PREFIX[chainId]}_wearer`] as Wearer;
  } catch (err) {
    logger.error('Error fetching wearer details:', err);
    return undefined;
  }

  return {
    ...wearer,
    currentHats: mapWithChainId(get(wearer, 'currentHats'), chainId),
  };
};

export const fetchWearersProfileDetails = async (addresses: string[] | undefined, chainId: number | undefined) => {
  if (!addresses || !chainId) return null;

  const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);

  const query = getWearersProfileDetailQuery(chainId);

  const res: unknown = await client.request(query, {
    ids: map(addresses, (address) => toLower(address)),
  });

  return get(res, `${NETWORKS_PREFIX[chainId]}_wearers`)
    ? (get(res, `${NETWORKS_PREFIX[chainId]}_wearers`, null) as Wearer[] | null)
    : null;
};

export const fetchWearerTrees = async ({
  chainId,
  wearer,
}: {
  chainId: number | undefined;
  wearer: Hex | undefined;
}) => {
  if (!chainId || !wearer) return [];

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);

    const query = getWearerTreesQuery(chainId);

    const res: unknown = await client.request(query, {
      id: wearer.toLowerCase(),
    });

    const wearerTrees = map(get(res, `${NETWORKS_PREFIX[chainId]}_wearer.currentHats`), 'tree') as AppTree[];

    const wearerTreesProcessHatMetadata = map(wearerTrees, (tree) => {
      const hats = get(tree, 'hats');
      const processedHats = map(hats, parseMetadata);
      return {
        ...tree,
        hats: processedHats,
      };
    });

    return uniqBy(wearerTreesProcessHatMetadata, 'id');
  } catch (err) {
    logger.error('Error fetching wearer trees:', err);
    return undefined;
  }
};

export const getCrossChainAllowlistEligibilities = async (address: string | undefined) => {
  if (!address) return null;

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
    const query = getCrossChainAllowlistEligibilitiesQuery();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      address: address.toLowerCase(),
    });

    return stripSuffix({ object: res });
  } catch (err) {
    logger.error('Error fetching cross-chain allowlist eligibilities:', err);
    return null;
  }
};

export const getCrossChainWearerDetails = async (address: string | undefined) => {
  if (!address) return null;

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
    const query = getCrossChainWearerDetailsQuery();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      id: address.toLowerCase(),
    });

    // Process each chain's wearer data to include chainId
    const processedData = Object.entries(res).reduce((acc: any, [key, value]) => {
      const chainPrefix = key.split('_')[0]; // TODO consolidate with util
      const chainId = Object.entries(NETWORKS_PREFIX).find(([_, prefix]) => prefix === chainPrefix)?.[0];

      if (chainId && value) {
        acc[key] = {
          ...value,
          currentHats: mapWithChainId(get(value, 'currentHats'), Number(chainId)),
        };
      }
      return acc;
    }, {});

    return processedData as Record<string, { currentHats: { id: string }[] }>;
  } catch (err) {
    logger.error('Error fetching cross-chain wearer details:', err);
    return null;
  }
};
