import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { GraphQLClient } from 'graphql-request';
import { mapWithChainId } from 'shared';

import {
  getTreeQuery,
  getTreesByIdQuery,
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

  console.log(
    `fetching tree deteils for ${treeId}, at ${new Date().toUTCString()}`,
  );
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

export const fetchTreesByIdMesh = async (
  treeIds: string[],
  chainId: number,
) => {
  const client = new GraphQLClient(process.env.NEXT_PUBLIC_HATS_API as string);
  const query = getTreesByIdQuery(chainId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await client.request(query, {
    ids: treeIds.map((treeId) => treeIdDecimalToHex(Number(treeId))),
  });

  const trees: Tree[] = res[`${NETWORKS_PREFIX[chainId]}_trees`];

  if (!trees) {
    throw new Error('Unexpected error');
  }

  return trees;
};
