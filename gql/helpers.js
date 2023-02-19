import _ from 'lodash';
import client from './client';
import {
  GET_TREE,
  GET_ALL_TREE_IDS,
  GET_ALL_TREES,
  GET_HAT,
  GET_WEARER_DETAILS,
} from './queries';

export const fetchTreeDetails = async (treeId, chainId) => {
  const result = await client(chainId).request(GET_TREE, { id: treeId });

  return _.get(result, 'tree', null);
};

export const fetchAllTreeIds = async (chainId) => {
  const result = await client(chainId).request(GET_ALL_TREE_IDS);

  return _.get(result, 'trees', null);
};

export const fetchAllTrees = async (chainId) => {
  const result = await client(chainId).request(GET_ALL_TREES);

  return _.get(result, 'trees', null);
};

export const fetchHatDetails = async (hatId, chainId) => {
  const result = await client(chainId).request(GET_HAT, { id: hatId });

  return _.get(result, 'hat', null);
};

export const fetchWearerDetails = async (address, chainId) => {
  const result = await client(chainId).request(GET_WEARER_DETAILS, {
    id: _.toLower(address),
  });

  return _.get(result, 'wearer', null);
};
