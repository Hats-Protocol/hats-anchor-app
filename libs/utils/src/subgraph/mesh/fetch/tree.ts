import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { map } from 'lodash';
import { mapWithChainId } from 'shared';

import { createMeshClient } from '../../../mesh/helpers';
import { getTreeQuery, getTreesByIdQuery, getTreesPaginatedQuery, NETWORKS_PREFIX } from '../queries';
import { parseMetadata } from './utils';

export const fetchTreeDetailsMesh = async (
  treeId: string | null | undefined,
  chainId: number,
): Promise<Tree | null> => {
  if (!treeId) {
    return null;
  }

  const client = createMeshClient();
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

export const fetchPaginatedTreesMesh = async (chainId: number, page = 0, perPage = 40) => {
  const client = createMeshClient();
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

  const fullTrees = mapWithChainId(trees, chainId) as Tree[];
  const withProcessedMetadata = map(fullTrees, (t: Tree) => {
    const updatedHats = map(t.hats, parseMetadata);

    return {
      ...t,
      hats: updatedHats,
    };
  });

  return withProcessedMetadata;
};

export const fetchTreesByIdMesh = async (treeIds: string[], chainId: number) => {
  const client = createMeshClient();
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
