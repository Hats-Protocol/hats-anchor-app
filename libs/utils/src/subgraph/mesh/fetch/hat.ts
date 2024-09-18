import { GraphQLClient } from 'graphql-request';
import { isEmpty, map } from 'lodash';
import { AppHat, HatWithMetadata } from 'types';

import { getHatsDetailsQuery, NETWORKS_PREFIX } from '../queries';

export const fetchHatsDetailsMesh = async (
  hatIds: string[],
  chainId?: number,
): Promise<AppHat[] | null> => {
  if (isEmpty(hatIds) || !chainId) return null;

  const client = new GraphQLClient(
    `${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string,
  );
  const query = getHatsDetailsQuery(chainId);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      ids: hatIds,
    });

    const hats: HatWithMetadata[] = res[`${NETWORKS_PREFIX[chainId]}_hats`];

    return map(hats, (hat) => ({
      ...hat,
      chainId,
    })) as unknown as AppHat[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching hat details: ', error);
    return null;
  }
};
