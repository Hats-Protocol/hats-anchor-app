import _ from 'lodash';

import { mapWithChainId } from '@/lib/general';
import { ITree } from '@/types';

import client from '../client';
import {
  GET_ALL_TREE_IDS,
  GET_ALL_TREES,
  GET_PAGINATED_TREES,
  GET_TREE,
  GET_TREES_BY_ID,
} from '../queries';

export const fetchTreeDetails = async (
  treeId: string | null,
  chainId: number,
): Promise<ITree | null> => {
  const result = await client(chainId).request(GET_TREE, { id: treeId });

  return _.get(result, 'tree', null);
};

export const fetchAllTreeIds = async (chainId: number) => {
  const result = await client(chainId).request(GET_ALL_TREE_IDS);

  return _.get(result, 'trees', null);
};

export const fetchAllTrees = async (chainId: number) => {
  const result = await client(chainId).request(GET_ALL_TREES);

  return mapWithChainId(_.get(result, 'trees'), chainId);
};

export const fetchPaginatedTrees = async (
  chainId: number,
  page: number = 0,
  perPage: number = 40,
) => {
  const result = await client(chainId).request(GET_PAGINATED_TREES, {
    skip: page * perPage,
    first: perPage,
  });

  return mapWithChainId(_.get(result, 'trees'), chainId);
};

export const fetchTreesById = async (treeIds: string[], chainId: number) => {
  const result = await client(chainId).request(GET_TREES_BY_ID, {
    ids: treeIds,
  });

  return _.get(result, 'trees', null);
};
