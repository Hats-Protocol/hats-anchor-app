import { GraphQLClient } from 'graphql-request';
import { AppHat, HatWithMetadata } from 'types';

import { getHatDetailsQuery, NETWORKS_PREFIX } from '../queries';

// eslint-disable-next-line import/prefer-default-export
export const fetchHatDetailsMesh = async (
  hatId: string | undefined,
  chainId?: number,
): Promise<AppHat | null> => {
  if (!hatId || hatId === '0x' || !chainId) return null;

  const client = new GraphQLClient(
    `${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string,
  );
  const query = getHatDetailsQuery(chainId);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      id: hatId,
    });

    const hat: HatWithMetadata = res[`${NETWORKS_PREFIX[chainId]}_hat`];

    return {
      ...hat,
      chainId,
    } as unknown as AppHat;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching hat details: ', error);
    return null;
  }
};
