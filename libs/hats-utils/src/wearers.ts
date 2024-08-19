import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { filter, flatten, get, isEmpty, map, toLower } from 'lodash';
import { HatWearer } from 'types';
import { isSameAddress, viemPublicClient } from 'utils';
import { Hex } from 'viem';

export const filterWearers = (
  searchTerm: string,
  wearers: HatWearer[] | undefined,
) => {
  if (!searchTerm || !wearers || isEmpty(wearers)) return wearers || [];

  return filter(wearers, (wearer: HatWearer) => {
    const idSearch = toLower(wearer.id).includes(toLower(searchTerm));
    const ensSearchTerm = get(wearer, 'ensName') || undefined;
    const ensSearch = toLower(ensSearchTerm).includes(toLower(searchTerm));

    return idSearch || ensSearch;
  });
};

export const fetchWearersEligibilities = async (
  wearerIds: Hex[],
  hatId: Hex,
  chainId: number,
) => {
  const eligibilityQueries = flatten(
    map(wearerIds, (wearer: Hex) => [
      {
        address: CONFIG.hatsAddress,
        abi: HATS_ABI,
        functionName: 'isEligible',
        args: [wearer, hatId],
      },
      {
        address: CONFIG.hatsAddress,
        abi: HATS_ABI,
        functionName: 'isInGoodStanding',
        args: [wearer, hatId],
      },
    ]),
  );

  // @ts-expect-error viem is seeing a type mismatch
  const localEligibilityData = await viemPublicClient(chainId).multicall({
    contracts: eligibilityQueries,
  });

  const eligibilityData = map(wearerIds, (wearer: Hex, index: number) => ({
    wearer,
    isEligible: get(localEligibilityData, `[${index * 2}].result`),
    isInGoodStanding: get(localEligibilityData, `[${index * 2 + 1}].result`),
  }));

  const eligibleWearers = map(
    filter(
      eligibilityData,
      ({ isEligible, isInGoodStanding }) => isEligible && isInGoodStanding,
    ),
    'wearer',
  );
  const ineligibleWearers = map(
    filter(
      eligibilityData,
      ({ isEligible, isInGoodStanding }) => !isEligible || !isInGoodStanding,
    ),
    'wearer',
  );

  return { eligibilityData, eligibleWearers, ineligibleWearers };
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
