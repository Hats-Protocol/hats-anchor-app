/* eslint-disable import/prefer-default-export */
import client from './client';
import { GET_TREE, GET_ALL_TREES } from './queries';

export const fetchTreeDetails = async (treeId, chainId) =>
  client(chainId).request(GET_TREE, { id: treeId });

export const fetchAllTreeIds = async (chainId) =>
  client(chainId).request(GET_ALL_TREES);
