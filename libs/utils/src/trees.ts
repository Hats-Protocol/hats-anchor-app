import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { concat, filter, flatten, get, includes, map, uniqBy } from 'lodash';
import { AppHat, HatWearer } from 'types';
import { zeroAddress } from 'viem';

import { fetchWearersProfileDetails } from './subgraph/mesh/fetch/wearer';

// ! move to hat-utils?

export const fetchTreeWearersDetails = async (hats: AppHat[] | undefined, chainId: number | undefined) => {
  if (!hats || !chainId) return [];

  // grab relevant wearers/controllers from hats
  const wearersList = map(hats, (hat: AppHat) => {
    return concat(hat.wearers, [{ id: hat.eligibility || zeroAddress }, { id: hat.toggle || zeroAddress }]);
  });

  // flatten then unique
  const uniqueWearersList = uniqBy(flatten(wearersList), 'id');
  // filter out nulls
  const filteredWearersList = filter(uniqueWearersList, (wearer) => {
    return get(wearer, 'id') && !includes(NULL_ADDRESSES, get(wearer, 'id'));
  });

  const wearersProfileDetails = await fetchWearersProfileDetails(map(filteredWearersList, 'id'), chainId);
  return wearersProfileDetails as HatWearer[];
};
