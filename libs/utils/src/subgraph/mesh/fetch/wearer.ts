import { Wearer } from '@hatsprotocol/sdk-v1-subgraph';
import { GraphQLClient } from 'graphql-request';
import { get, map } from 'lodash';
import { mapWithChainId } from 'shared';
import { AppTree } from 'types';
import { Hex } from 'viem';

import { getWearerDetailsQuery, getWearerTreesQuery, NETWORKS_PREFIX } from '../queries';

// eslint-disable-next-line import/prefer-default-export
export const fetchWearerDetailsMesh = async (
  address: Hex | string | undefined,
  chainId: number | undefined,
) => {
  if (!address || !chainId) return undefined;
  let wearer: Wearer | undefined;

  try {
    const client = new GraphQLClient(
      `${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string,
    );
    const query = getWearerDetailsQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      id: address.toLowerCase(),
    });

    wearer = res[`${NETWORKS_PREFIX[chainId]}_wearer`] as Wearer;
  } catch (err) {
    return undefined;
  }

  return {
    ...wearer,
    currentHats: mapWithChainId(get(wearer, 'currentHats'), chainId),
  };
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
    const client = new GraphQLClient(
      `${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string,
    );

    const query = getWearerTreesQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: unknown = await client.request(query, {
      id: wearer.toLowerCase(),
    });

    return map(get(res, `${NETWORKS_PREFIX[chainId]}_wearer.currentHats`), 'tree') as AppTree[];
  } catch (err) {

    return undefined;
  }
}

