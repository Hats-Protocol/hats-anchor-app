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

// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const localList = _.uniqBy(wearersList, 'id');
  const promises = _.map(_.uniqBy(wearersList, 'id'), (wearer: HatWearer) =>
    extendWearerDetails(wearer.id, chainId),
  ) as unknown as Promise<unknown>[];
  const extendedWearersPromises = _.map(
    promises,
    async (promise: Promise<unknown>, index: number) => {
      const aggDelay = 500 + index * 500;
      return delay(aggDelay).then(() => promise);
    },
  );
  return Promise.allSettled(extendedWearersPromises)
    .then((results) =>
      _.flatten(
        _.map(results, (result: PromiseSettledResult<unknown>, i: number) =>
          result.status === 'fulfilled'
            ? (result.value as HatWearer)
            : ({ id: _.get(localList, `[${i}].id`, '0x') } as HatWearer),
        ),
      ),
    )
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    });
};
