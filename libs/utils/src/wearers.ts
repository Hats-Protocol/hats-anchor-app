import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import _, { delay } from 'lodash';
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

  const wearersList = _.compact(
    _.concat(hat.wearers, [
      hat.eligibility && { id: hat.eligibility },
      hat.toggle && { id: hat.toggle },
    ]),
  );
  const promises = _.map(_.uniqBy(wearersList, 'id'), (wearer: HatWearer) =>
    extendWearerDetails(wearer.id, chainId),
  );
  const extendedWearersPromises = promises.map(
    async (promise: Promise<unknown>, index: number) => {
      if (index % 2 === 0 && index !== 0) {
        await delay(1000); // Delay 1 second every 2 promises
      }
      return promise;
    },
  );

  return Promise.allSettled(extendedWearersPromises)
    .then((results) =>
      _.flatten(
        _.map(results, (result: PromiseSettledResult<unknown>) =>
          result.status === 'fulfilled' ? result.value : null,
        ),
      ),
    )
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    });
};
