/* eslint-disable import/prefer-default-export */
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import _ from 'lodash';
import { AppHat, HatWearer } from 'types';

import { extendWearerDetails } from './wearers';

export const fetchTreeWearersDetails = async (
  hats: AppHat[] | undefined,
  chainId: number | undefined,
) => {
  if (!hats || !chainId) return [];
  // Trying to be very methodical about when we need to fetch data
  // for batches of wearers as these can grow quickly across a tree
  const wearersList: HatWearer[] = [];
  // check if hat has multiple wearers (groups are not checked)
  _.forEach(hats, (hat: AppHat) => {
    const firstWearer = _.first(hat.wearers);
    if (_.size(hat.wearers) === 1 && firstWearer) {
      wearersList.push(firstWearer);
    }
    if (!!hat.eligibility && !_.includes(NULL_ADDRESSES, hat.eligibility)) {
      wearersList.push({ id: hat.eligibility });
    }
    if (!!hat.toggle && !_.includes(NULL_ADDRESSES, hat.toggle)) {
      wearersList.push({ id: hat.toggle });
    }
  });

  // fetch data for solo wearers, return data as is
  const promises = _.map(_.uniqBy(wearersList, 'id'), (wearer: HatWearer) =>
    extendWearerDetails(wearer.id, chainId),
  );
  const wearerData = await Promise.all(promises);
  return wearerData as HatWearer[];
};
