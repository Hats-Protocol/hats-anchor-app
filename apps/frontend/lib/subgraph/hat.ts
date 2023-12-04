import { Hat } from 'hats-types';

import { createSubgraphClient } from '../web3';

export const fetchHatDetails = async (
  hatId: string | undefined,
  chainId?: number,
): Promise<Hat | null> => {
  if (!hatId || !chainId) return null;

  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getHat({
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

  return {
    ...res,
    chainId,
  } as unknown as Hat;
};

export const fetchManyHatDetails = async (
  hatIds: string[],
  chainId: number,
): Promise<Hat[]> => {
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

  return (res as unknown as Hat[]).map((hat) => ({
    ...hat,
    chainId,
  }));
};
