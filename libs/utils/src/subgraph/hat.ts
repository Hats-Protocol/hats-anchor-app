import { mapWithChainId } from 'shared';
import { AppHat, SupportedChains } from 'types';

import { createSubgraphClient } from '../web3';

export const fetchHatDetails = async (
  hatId: string | undefined,
  chainId?: number,
): Promise<AppHat | null> => {
  if (!hatId || !chainId) return null;

  const subgraphClient = createSubgraphClient();

  let res;
  try {
    res = await subgraphClient.getHat({
      chainId,
      hatId: BigInt(hatId),
      props: {
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
        claimableBy: {
          props: {},
        },
        claimableForBy: {
          props: {},
        },
        currentSupply: true,
        tree: {},
        wearers: {
          props: {},
        },
        admin: {},
        events: {
          props: {
            timestamp: true,
            transactionID: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching hat details: ', error);
  }

  return {
    ...res,
    chainId,
  } as unknown as AppHat;
};

export const fetchManyHatDetails = async (
  hatIds: string[],
  chainId: SupportedChains,
): Promise<AppHat[]> => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getHatsByIds({
    chainId,
    hatIds: hatIds.map((id) => BigInt(id)),
    props: {
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
      claimableBy: {
        props: {},
      },
      claimableForBy: { props: {} },
      currentSupply: true,
      tree: {},
      wearers: { props: {} },
      admin: {},
      events: {
        props: { timestamp: true, transactionID: true },
      },
    },
  });

  return mapWithChainId(res, chainId) as AppHat[];
};
