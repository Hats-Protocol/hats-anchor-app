/* eslint-disable import/prefer-default-export */
import _ from 'lodash';

import { HatDetails } from '@/types';

// app-utils

const includesKeys = (data: unknown, keys: string[]) =>
  _.every(_.keys(data), (k: any) => _.includes(keys, k));

export interface DetailsData {
  type: string;
  data: HatDetails;
}

export const handleNestedDetails = (data: unknown): DetailsData | undefined => {
  let detailsData: DetailsData | undefined;
  if (includesKeys(_.get(data, 'data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data');
  } else if (includesKeys(_.get(data, 'data.data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data.data');
  } else if (includesKeys(_.get(data, 'data.data.data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data.data.data');
  }
  return detailsData;
};
