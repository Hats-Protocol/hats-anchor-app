import { Tree } from '@hatsprotocol/sdk-v1-subgraph';

import { fetchPaginatedTreesMesh, fetchTreeDetailsMesh, fetchTreesByIdMesh } from './mesh/fetch/tree';

export const fetchTreeDetails = async (treeId: string | null | undefined, chainId: number): Promise<Tree | null> => {
  return fetchTreeDetailsMesh(treeId, chainId);
};

export const fetchPaginatedTrees = async (chainId: number, page = 0, perPage = 40) => {
  return fetchPaginatedTreesMesh(chainId, page, perPage);
};

export const fetchTreesById = async (treeIds: string[], chainId: number) => {
  return fetchTreesByIdMesh(treeIds, chainId);
};
