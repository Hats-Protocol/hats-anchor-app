import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { AppHat, HatWearer } from 'types';
import { Hex, zeroAddress } from 'viem';
import { fetchEnsName } from 'wagmi/actions';

import { checkAddressIsContract } from './contract';

export const extendWearerDetails = async (
  wearer: Hex,
  chainId: number | undefined,
) => {
  if (!wearer || !chainId) return null;
  const defaultWearer = { id: wearer, isContract: false, ensName: '' };

  if (wearer === FALLBACK_ADDRESS || wearer === zeroAddress) {
    return Promise.resolve(defaultWearer);
  }

  return Promise.all([
    checkAddressIsContract(wearer, chainId),
    fetchEnsName({
      address: wearer,
      chainId: 1, // override to use mainnet
    }),
  ])
    .then((data) => {
      if (!data) return defaultWearer;

      const [isContract, ensName] = data as [boolean, string];

      return Promise.resolve({
        id: wearer,
        isContract,
        ensName: ensName || '',
      });
    })
    .catch(async (err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.resolve(defaultWearer);
    });
};

export const fetchHatWearerDetails = async (
  hat: AppHat,
  chainId: number | undefined,
): Promise<HatWearer[]> => {
  if (!hat || !chainId) return [];

  const wearersList = _.concat(hat.wearers, [
    { id: hat.eligibility },
    { id: hat.toggle },
  ]);
  const promises = _.map(wearersList, (wearer: HatWearer) =>
    extendWearerDetails(wearer.id, chainId),
  );
  return Promise.all(promises)
    .then((wearerData) => {
      return wearerData as HatWearer[];
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return Promise.resolve([]);
    });
};
