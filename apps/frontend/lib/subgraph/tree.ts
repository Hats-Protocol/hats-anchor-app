import { mapWithChainId } from '@/lib/general';
import { createSubgraphClient } from '@/lib/web3';
import { Tree } from '@/types';

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
          claimableBy: { props: {} },
          claimableForBy: { props: {} },
          currentSupply: true,
          tree: {},
          wearers: { props: {} },
          admin: {},
        },
      },
      events: {
        props: {
          timestamp: true,
          transactionID: true,
          hat: {
            prettyId: true,
          },
        },
        filters: { first: 100 },
      },
      linkRequestFromTree: {
        props: {
          requestedLinkToHat: {
            prettyId: true,
          },
        },
      },
      childOfTree: {},
      parentOfTrees: {
        props: {
          linkedToHat: {
            prettyId: true,
          },
          hats: {
            // TODO do we need more keys here?
            // ? ID is not an option?
            props: { prettyId: true },
          },
        },
      },
      linkedToHat: {
        prettyId: true,
        tree: {},
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
        props: {
          details: true,
          imageUri: true,
          prettyId: true,
          admin: {
            prettyId: true,
          },
        },
        filters: { first: 1 },
      },
    },
    page,
    perPage,
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
        props: {
          details: true,
          imageUri: true,
          prettyId: true,
          admin: {
            prettyId: true,
          },
          wearers: { props: {} },
        },
      },
      childOfTree: {},
      parentOfTrees: {
        props: {
          linkedToHat: {
            prettyId: true,
          },
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
