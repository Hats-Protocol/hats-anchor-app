import _ from 'lodash';

import { Hat } from '@/types';

import client from '../client';
import { GET_HAT, GET_HATS_BY_IDS } from '../queries';

export const fetchHatDetails = async (
  hatId: string | undefined,
  chainId: number,
): Promise<Hat | null> => {
  if (!hatId) return null;

  const result = await client(chainId).request(GET_HAT, { id: hatId });

  return {
    ...(_.get(result, 'hat', {}) as Hat),
    chainId,
  };
};

export const fetchManyHatDetails = async (
  hatIds: string[],
  chainId: number,
): Promise<Hat[]> => {
  const result = await client(chainId).request(GET_HATS_BY_IDS, {
    ids: hatIds,
  });

  return (_.get(result, 'hats', []) as Hat[]).map((hat) => ({
    ...hat,
    chainId,
  }));
};
