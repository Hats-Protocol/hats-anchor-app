import _ from 'lodash';
import { HatWearer } from 'types';
import { isSameAddress } from 'utils';
import { Hex } from 'viem';

// still used?
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

// still used?
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

  return _.filter(wearers, (wearer: HatWearer) => {
    const idSearch = _.toLower(wearer.id).includes(_.toLower(searchTerm));
    const ensSearchTerm = _.get(wearer, 'ensName') || undefined;
    const ensSearch = _.toLower(ensSearchTerm).includes(_.toLower(searchTerm));

    return idSearch || ensSearch;
  });
};

export const sortWearers = ({
  wearers,
  address,
}: {
  wearers?: HatWearer[];
  address?: Hex;
}) => {
  if (!wearers) return [];

  const currentUser = wearers?.filter((w) => isSameAddress(w.id, address));
  const otherUsers = wearers?.filter((w) => !isSameAddress(w.id, address));

  otherUsers?.sort((w1, w2) => {
    if (w1.ensName && w2.ensName) return w1.ensName.localeCompare(w2.ensName);
    if (w1.ensName) return -1;
    if (w2.ensName) return 1;

    // For 0x addresses: Sort based on their numerical value, then uppercase, then lowercase.
    const addr1Without0x = w1.id.slice(2);
    const addr2Without0x = w2.id.slice(2);

    const num1 = parseInt(addr1Without0x, 16);
    const num2 = parseInt(addr2Without0x, 16);

    if (num1 !== num2) return num1 - num2;

    const upperCaseRegex = /[A-F]/;
    const isUpper1 = upperCaseRegex.test(addr1Without0x);
    const isUpper2 = upperCaseRegex.test(addr2Without0x);

    if (isUpper1 && isUpper2) return w1.id.localeCompare(w2.id);
    if (isUpper1) return -1;
    if (isUpper2) return 1;

    return w1.id.localeCompare(w2.id);
  });

  return [...currentUser, ...otherUsers];
};

export const maxSupplyText = (maxSupply: number) => {
  if (_.toNumber(maxSupply) > 999) {
    const rounds = [1_000_000_000, 1_000_000, 1_000];
    const formatString = [`e9`, `e6`, `k`];
    const supplyRounded = _.map(rounds, (r: number) =>
      _.round(_.toNumber(maxSupply) / r, 0),
    );
    const index = _.findIndex(supplyRounded, (v: number) => v > 0);

    return `${supplyRounded[index]}${formatString[index]}`;
  }
  return maxSupply;
};
