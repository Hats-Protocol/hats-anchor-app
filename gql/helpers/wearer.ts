import { fetchEnsName } from '@wagmi/core';
import _ from 'lodash';
import { Hex } from 'viem';

import { checkAddressIsContract } from '@/lib/contract';
import { mapWithChainId } from '@/lib/general';
import { chainsList, createSubgraphClient } from '@/lib/web3';
import { Hat, HatWearer } from '@/types';

const chains = _.keys(chainsList);

export const wearersPerPage = 100;

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
  const subgraphClient = createSubgraphClient();

  let res: any;
  try {
    res = await subgraphClient.getWearer({
      chainId,
      wearerAddress: address as Hex,
      props: {
        currentHats: {
          prettyId: true,
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          claimableBy: {},
          claimableForBy: {},
          currentSupply: true,
          tree: {},
          wearers: {},
          admin: {},
          events: {
            timestamp: true,
            transactionID: true,
          },
        },
      },
    });
  } catch (err) {
    res = {};
  }

  return {
    ...res,
    currentHats: mapWithChainId(res.currentHats, chainId),
  };
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

  // * let errors fall through here
  return Promise.all(_.map(promises, (p) => p.catch(() => undefined))).then(
    (data) => {
      // TODO handle errors on subgraph(s) with the user
      return Promise.resolve(_.flatten(_.map(_.compact(data), 'currentHats')));
    },
  );
};

export const fetchPaginatedWearersForHat = async (
  hatId: string,
  chainId: number,
  page: number = 0,
) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getWearersOfHatPaginated({
    chainId,
    hatId: BigInt(hatId),
    props: {},
    page,
    perPage: wearersPerPage,
  });

  const wearersWithDetails = await fetchManyWearerDetails(
    _.map(res, 'id') as Hex[],
    chainId,
  );

  return wearersWithDetails;
};
