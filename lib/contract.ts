import _ from 'lodash';
import { createPublicClient, custom, http } from 'viem';

import { ZERO_ADDRESS } from '@/constants';
import { IHatWearer } from '@/types';

import { chainsMap } from './web3';

export const checkAddressIsContract = async (
  address: `0x${string}`,
  chainId: number,
) => {
  if (address === ZERO_ADDRESS) {
    return false;
  }

  const publicClient = createPublicClient({
    chain: chainsMap(chainId),
    transport: custom((window as any).ethereum) || http(),
  });

  const bytecode = await publicClient.getBytecode({
    address,
  });

  if (bytecode) {
    return true;
  }
  return false;
};

export const extendWearers = (wearers: IHatWearer[], wearersInfo: object[]) => {
  if (_.gt(_.size(wearers), 1)) {
    return wearers;
  }

  return _.map(wearers, (wearer: IHatWearer) => {
    const wearerInfo = _.find(wearersInfo, { id: wearer.id });
    return {
      ...wearer,
      ...wearerInfo,
    };
  });
};

export const extendControllers = (
  controller: `0x${string}`,
  controllersInfo: object[],
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
