import _ from 'lodash';

import { IHat, IHatWearer } from '@/types';

// This function can be moved outside the component, as it does not depend on any component-specific props or state
export const getEligibleWearers = ({
  wearersEligibility,
  wearers,
  selectedHat,
}: {
  wearersEligibility: any;
  wearers: IHatWearer[];
  selectedHat?: IHat;
}) => {
  const eligibleWearers = wearersEligibility
    ? wearers?.filter((w: { id: string }) =>
        isWearerEligible(w.id, wearersEligibility),
      )
    : wearers;

  return _.get(selectedHat, 'extendedWearers', eligibleWearers);
};

// Moved the eligibility function outside, for the same reason as above.
export const isWearerEligible = (
  wearerId: string,
  wearersEligibility: any[],
) => {
  const eligibleEntry = _.find(wearersEligibility, { address: wearerId });
  return !!eligibleEntry?.isEligible;
};

export const filterWearers = (
  searchTerm: string,
  wearers: IHatWearer[] | undefined,
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
