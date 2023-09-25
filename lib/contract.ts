import _ from 'lodash';
import { createPublicClient, custom, Hex, http } from 'viem';

import { ZERO_ADDRESS } from '@/constants';
import { IHatWearer } from '@/types';

import { chainsMap } from './web3';

export const checkAddressIsContract = async (
  address?: Hex,
  chainId?: number,
) => {
  if (!address || address === ZERO_ADDRESS || !chainId) {
    return false;
  }

  const publicClient = createPublicClient({
    chain: chainsMap(chainId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom((window as any).ethereum) || http(),
  });

  if (!publicClient) return false;

  try {
    const bytecode = await publicClient.getBytecode({
      address,
    });

    if (bytecode) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
};

export const extendWearers = (
  wearers: IHatWearer[],
  wearersInfo: IHatWearer[] | undefined,
): IHatWearer[] =>
  _.compact(
    _.map(wearers, (wearer: IHatWearer) => {
      const wearerInfo = _.find(wearersInfo, { id: _.toLower(wearer.id) });
      return wearerInfo as IHatWearer | undefined;
    }),
  );

export const extendControllers = (
  controller: Hex,
  controllersInfo: IHatWearer[] | undefined,
) => {
  const controllerInfo = _.find(controllersInfo, { id: controller });

  return {
    id: controller,
    ...controllerInfo,
  };
};

export const checkENSNames = async (wearers: IHatWearer[]) => {
  const publicClient = createPublicClient({
    chain: chainsMap(1),
    transport: http(),
  });

  const ensNamePromises = wearers?.map(async (wearer: IHatWearer) => {
    const ensName = await publicClient.getEnsName({
      address: wearer.id,
    });

    return { id: wearer.id, ensName };
  });

  if (ensNamePromises) {
    const ensNamesList = await Promise.all(ensNamePromises);

    const newEnsNames = ensNamesList.reduce(
      (acc: { [key: string]: string }, { id, ensName }) => {
        if (ensName) {
          acc[id] = ensName;
        }
        return acc;
      },
      {},
    );
    return newEnsNames;
  }

  return {};
};
