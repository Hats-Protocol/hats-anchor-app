/* eslint-disable import/prefer-default-export */
import { createPublicClient, http, custom } from 'viem';
import _ from 'lodash';
import { IHatWearer } from '@/types';
import { chainsMap } from './web3';

export const checkAddressIsContract = async (
  address: `0x${string}`,
  chainId: number,
) => {
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

export const extendWearers = (wearers: any, wearersInfo: any) => {
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

export const extendControllers = async (
  controller: `0x${string}`,
  controllersInfo: any,
) => {
  const controllerInfo = _.find(controllersInfo, { id: controller });

  return {
    id: controller,
    ...controllerInfo,
  };
};
