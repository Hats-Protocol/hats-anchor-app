import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { GraphQLClient } from 'graphql-request';
import { mapWithChainId } from 'shared';

import {
  getTreeQuery,
  getTreesPaginatedQuery,
  NETWORKS_PREFIX,
} from '../queries';

export const fetchTreeDetailsMesh = async (
  treeId: string | null | undefined,
  chainId: number,
): Promise<Tree | null> => {
  if (!treeId) {
    return null;
  }

  const client = new GraphQLClient(process.env.NEXT_PUBLIC_HATS_API as string);
  const query = getTreeQuery(chainId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await client.request(query, {
    id: treeIdDecimalToHex(Number(treeId)),
  });

  const tree: Tree = res[`${NETWORKS_PREFIX[chainId]}_tree`];

  if (!tree) {
    throw new Error('Unexpected error');
  }

  return tree;
};

export const fetchPaginatedTreesMesh = async (
  chainId: number,
  page: number = 0,
  perPage: number = 40,
) => {
  const client = new GraphQLClient(process.env.NEXT_PUBLIC_HATS_API as string);
  const query = getTreesPaginatedQuery(chainId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await client.request(query, {
    skip: page * perPage,
    first: perPage,
  });

  const trees: Tree[] = res[`${NETWORKS_PREFIX[chainId]}_trees`];

  if (!trees) {
    throw new Error('Unexpected error');
  }

  return mapWithChainId(trees, chainId) as Tree[];
};

/*
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
          currentSupply: true,
          admin: {
            prettyId: true,
          },
          wearers: { props: {}, filters: { first: 5 } },
          status: true,
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
*/
