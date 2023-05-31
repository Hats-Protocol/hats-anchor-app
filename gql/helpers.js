import _ from 'lodash';

import { mapWithChainId } from '@/lib/general';

import client from './client';
import {
  GET_TREE,
  GET_ALL_TREE_IDS,
  GET_ALL_TREES,
  GET_HAT,
  GET_WEARER_DETAILS,
  GET_ALL_WEARERS,
  GET_PAGINATED_TREES,
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

  return mapWithChainId(_.get(result, 'trees', null), chainId);
};

export const fetchPaginatedTrees = async (chainId, page, perPage) => {
  const result = await client(chainId).request(GET_PAGINATED_TREES, {
    skip: (page - 1) * perPage,
    first: perPage,
  });

  return mapWithChainId(_.get(result, 'trees', null), chainId);
};

export const fetchHatDetails = async (hatId, chainId) => {
  const result = await client(chainId).request(GET_HAT, { id: hatId });

  return {
    ..._.get(result, 'hat', {}),
    chainId,
  };
};

export const fetchWearerDetails = async (address, chainId) => {
  const result = await client(chainId).request(GET_WEARER_DETAILS, {
    id: _.toLower(address),
  });
  const wearer = _.get(result, 'wearer', null);

  return {
    ...wearer,
    currentHats: mapWithChainId(wearer?.currentHats, chainId),
  };
};

export const fetchAllWearers = async (chainId) => {
  const result = await client(chainId).request(GET_ALL_WEARERS);

  return _.get(result, 'wearers', null);
};

export const fetchAllWearerDetails = async (address) => {
  const goerliWearing = await fetchWearerDetails(address, 5);
  const gnosisWearing = await fetchWearerDetails(address, 100);
  const polygonWearing = await fetchWearerDetails(address, 137);

  return {
    5: goerliWearing,
    100: gnosisWearing,
    137: polygonWearing,
  };
};
