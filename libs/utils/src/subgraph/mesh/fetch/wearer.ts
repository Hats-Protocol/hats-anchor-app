import { Wearer } from '@hatsprotocol/sdk-v1-subgraph';
import { GraphQLClient } from 'graphql-request';
import { mapWithChainId } from 'shared';
import { Hex } from 'viem';

import { getWearerDetailsQuery, NETWORKS_PREFIX } from '../queries';

// eslint-disable-next-line import/prefer-default-export
export const fetchWearerDetailsMesh = async (
  address: Hex | string | undefined,
  chainId: number | undefined,
) => {
  if (!address || !chainId) return undefined;
  let wearer: Wearer | undefined;

  try {
    const client = new GraphQLClient(
      process.env.NEXT_PUBLIC_HATS_API as string,
    );
    const query = getWearerDetailsQuery(chainId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      id: address,
    });

    wearer = res[`${NETWORKS_PREFIX[chainId]}_wearer`] as Wearer;
  } catch (err) {
    return undefined;
  }

  return {
    ...wearer,
    currentHats: mapWithChainId(wearer.currentHats, chainId),
  };
};
