import { compact, isEmpty, map } from 'lodash';
import { AppHat, HatWithMetadata } from 'types';

import { createMeshClient } from '../../../mesh/helpers';
import { getHatsDetailsQuery, NETWORKS_PREFIX } from '../queries';

export const fetchHatsDetailsMesh = async (hatIds: string[], chainId?: number): Promise<AppHat[] | null> => {
  const localHats = compact(hatIds);
  if (isEmpty(localHats) || !chainId) return null;

  const client = createMeshClient();
  const query = getHatsDetailsQuery(chainId);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await client.request(query, {
      ids: localHats,
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
