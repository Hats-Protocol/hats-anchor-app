import { fetchEnsName } from '@wagmi/core';
import _ from 'lodash';
import { Hex } from 'viem';

import { checkAddressIsContract } from '@/lib/contract';
import { mapWithChainId } from '@/lib/general';
import { chainsList } from '@/lib/web3';
import { Hat, HatWearer } from '@/types';

import client from '../client';
import { GET_ALL_WEARERS, GET_WEARER_DETAILS } from '../queries';

const chains = _.keys(chainsList);

export const fetchManyWearerDetails = async (
  wearerIds: Hex[],
  chainId: number,
): Promise<HatWearer[]> => {
  // two promises per address
  const promises = wearerIds.map((wearerId: Hex) => {
    return [
      checkAddressIsContract(wearerId, chainId),
      fetchEnsName({
        address: wearerId,
        chainId: 1,
      }),
    ];
  });
  const data = await Promise.all(_.flatten(promises)).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    return [];
  });

  // map with ID so can be looked up later
  return _.map(wearerIds, (wearerId, index) => {
    return {
      id: wearerId,
      isContract: data[index * 2] as boolean,
      ensName: data[index * 2 + 1] as string,
    };
  });
};

export const fetchWearerDetails = async (
  address: Hex | string | undefined,
  chainId: number,
) => {
  const result = await client(chainId).request(GET_WEARER_DETAILS, {
    id: _.toLower(address as string),
  });
  const wearer: any = _.get(result, 'wearer', {});

  return {
    ...wearer,
    currentHats: mapWithChainId(wearer?.currentHats, chainId),
  };
};

export const fetchAllWearers = async (chainId: number) => {
  const result = await client(chainId).request(GET_ALL_WEARERS);

  return _.get(result, 'wearers', null);
};

export const fetchWearerDetailsForChain = async (
  address: string | undefined,
  chainId: number,
) => {
  if (!address) return [];
  const data: { currentHats: Hat[] } = await fetchWearerDetails(
    address,
    chainId,
  );

  return data.currentHats;
};

export const fetchWearerDetailsForAllChains = async (
  address: string | undefined,
) => {
  if (!address) return [];
  const promises = _.map(chains, (cId: string) =>
    fetchWearerDetails(address, Number(cId)),
  );
  return Promise.all(_.map(promises, (p) => p.catch((e) => undefined))).then(
    (data) => {
      return _.compact(_.flatten(_.map(data, 'currentHats')));
    },
  );
};
