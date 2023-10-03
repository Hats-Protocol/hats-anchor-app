import _ from 'lodash';

import { HatWearer } from '@/types';

export const getEligibleWearers = ({
  wearersEligibility,
  wearers,
}: {
  wearersEligibility: { address: string; isEligible: boolean }[] | undefined;
  wearers: HatWearer[];
}): HatWearer[] => {
  const eligibleWearers = wearersEligibility
    ? wearers?.filter((w: { id: string }) =>
        isWearerEligible(w.id, wearersEligibility),
      )
    : wearers;

  return eligibleWearers;
};

export const isWearerEligible = (
  wearerId: string,
  wearersEligibility: { address: string; isEligible: boolean }[] | undefined,
) => {
  const eligibleEntry = _.find(wearersEligibility, { address: wearerId });
  return !!eligibleEntry?.isEligible;
};

export const filterWearers = (
  searchTerm: string,
  wearers: HatWearer[] | undefined,
) => {
  if (!searchTerm || !wearers) return wearers;

  return _.filter(wearers, (wearer) => {
    const idSearch = wearer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const ensSearch = wearer.ensName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return idSearch || ensSearch;
  });
};
