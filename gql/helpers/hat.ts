import _ from 'lodash';

import { IHat } from '@/types';

import client from '../client';
import { GET_HAT, GET_HATS_BY_IDS } from '../queries';

export const fetchHatDetails = async (
  hatId: string | undefined,
  chainId: number,
): Promise<IHat | null> => {
  if (!hatId) return null;

  const result = await client(chainId).request(GET_HAT, { id: hatId });

  return {
    ...(_.get(result, 'hat', {}) as IHat),
    chainId,
  };
};

export const fetchManyHatDetails = async (
  hatIds: string[],
  chainId: number,
): Promise<IHat[]> => {
  const result = await client(chainId).request(GET_HATS_BY_IDS, {
    ids: hatIds,
  });

  return (_.get(result, 'hats', []) as IHat[]).map((hat) => ({
    ...hat,
    chainId,
  }));
};
