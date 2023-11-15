import { mapWithChainId } from '@/lib/general';
import { Tree } from '@/types';

import { createSubgraphClient } from '../../lib/web3';

export const fetchTreeDetails = async (
  treeId: string | null,
  chainId: number,
): Promise<Tree | null> => {
  if (treeId === null) {
    return null;
  }
  const subgraphClient = createSubgraphClient();

  const res = (await subgraphClient.getTree({
    chainId,
    treeId: +treeId,
    props: {
      hats: {
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
      },
      events: {
        timestamp: true,
        transactionID: true,
        hat: {
          prettyId: true,
        },
      },
      linkRequestFromTree: {
        requestedLinkToHat: {
          prettyId: true,
        },
      },
      childOfTree: {},
      parentOfTrees: {
        linkedToHat: {
          prettyId: true,
        },
        hats: {
          // TODO do we need more keys here?
          // ? ID is not an option?
          prettyId: true,
        },
      },
      linkedToHat: {
        prettyId: true,
        tree: {},
      },
    },
    filters: {
      first: {
        tree: {
          events: 5,
        },
      },
    },
  })) as unknown as Tree;

  return res;
};

export const fetchPaginatedTrees = async (
  chainId: number,
  page: number = 0,
  perPage: number = 40,
) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getTreesPaginated({
    chainId,
    props: {
      hats: {
        details: true,
        imageUri: true,
        prettyId: true,
        admin: {
          prettyId: true,
        },
      },
    },
    page,
    perPage,
    filters: {
      first: {
        tree: {
          hats: 1,
        },
      },
    },
  });

  return mapWithChainId(res, chainId);
};

export const fetchTreesById = async (treeIds: string[], chainId: number) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getTreesByIds({
    chainId,
    treeIds: treeIds.map((id) => +id),
    props: {
      hats: {
        details: true,
        imageUri: true,
        prettyId: true,
        admin: {
          prettyId: true,
        },
        wearers: {},
      },
      childOfTree: {},
      parentOfTrees: {
        linkedToHat: {
          prettyId: true,
        },
      },
      linkedToHat: {
        prettyId: true,
        tree: {},
      },
    },
  });

  return res as unknown as Tree[];
};
