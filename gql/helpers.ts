import _ from 'lodash';

import { mapWithChainId } from '@/lib/general';
import { fetchEnsName } from '@wagmi/core';
import { checkAddressIsContract } from '@/lib/contract';

import client from './client';
import {
  GET_TREE,
  GET_ALL_TREE_IDS,
  GET_ALL_TREES,
  GET_HAT,
  GET_WEARER_DETAILS,
  GET_ALL_WEARERS,
  GET_PAGINATED_TREES,
} from './queries';

export const fetchTreeDetails = async (
  treeId: string | null,
  chainId: number,
) => {
  const result = await client(chainId).request(GET_TREE, { id: treeId });

  return _.get(result, 'tree', null);
};

export const fetchAllTreeIds = async (chainId: number) => {
  const result = await client(chainId).request(GET_ALL_TREE_IDS);

  return _.get(result, 'trees', null);
};

export const fetchAllTrees = async (chainId: number) => {
  const result = await client(chainId).request(GET_ALL_TREES);

  return mapWithChainId(_.get(result, 'trees', null), chainId);
};

export const fetchPaginatedTrees = async (
  chainId: number,
  page: number,
  perPage: number,
) => {
  const result = await client(chainId).request(GET_PAGINATED_TREES, {
    skip: page * perPage,
    first: perPage,
  });

  return mapWithChainId(_.get(result, 'trees', null), chainId);
};

export const fetchHatDetails = async (
  hatId: string | undefined,
  chainId: number,
): Promise<any> => {
  if (!hatId) return {};

  const result = await client(chainId).request(GET_HAT, { id: hatId });

  return {
    ..._.get(result, 'hat', {}),
    chainId,
  };
};

export const fetchHatsDetails = async (
  hatIds: string[],
  chainId: number,
): Promise<any[]> => {
  const requests = hatIds.map((hatId) => fetchHatDetails(hatId, chainId));
  return Promise.all(requests);
};

export const fetchManyWearerDetails = async (
  wearerIds: `0x${string}`[],
  chainId: number,
) => {
  // two promises per address
  const promises = wearerIds.map((wearerId: `0x${string}`) => {
    return [
      checkAddressIsContract(wearerId, chainId),
      fetchEnsName({
        address: wearerId,
        chainId: 1,
      }),
    ];
  });
  const data = await Promise.all(_.flatten(promises)).catch((err) => {
    console.log(err);
    return [];
  });

  // map with ID so can be looked up later
  return _.map(wearerIds, (wearerId, index) => {
    return {
      id: wearerId,
      isContract: data[index * 2],
      ensName: data[index * 2 + 1],
    };
  });
};

export const fetchAllTreesByIds = async (treeIds: any[], chainId: number) => {
  console.log('treeIds', treeIds);
  const promises = treeIds.map((treeId) => fetchHatDetails(treeId, chainId));
  const treeDetails = await Promise.all(promises);

  return treeDetails.filter((tree) => tree !== null);
};

export const fetchWearerDetails = async (
  address: `0x${string}` | string | undefined,
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

export const fetchAllWearerDetails = async (address: string) => {
  const goerliWearing = await fetchWearerDetails(address, 5);
  const gnosisWearing = await fetchWearerDetails(address, 100);
  const polygonWearing = await fetchWearerDetails(address, 137);

  return {
    5: goerliWearing,
    100: gnosisWearing,
    137: polygonWearing,
  };
};
