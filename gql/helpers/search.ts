import _ from 'lodash';

import { chainsList } from '@/lib/web3';
import { ITree, IHat } from '@/types';
import client from '../client';
import { SEARCH_QUERY } from '../queries';
import { prettyIdToIp, idToPrettyId } from '@/lib/hats';
import { Hex } from 'viem';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processForCommandPalette = (key: string, record: any) => {
  const parts = _.split(_.get(record, 'id'), '.');
  const treeId = prettyIdToIp(idToPrettyId(_.first(parts) as Hex));
  let href = '#';
  if (key === 'trees') {
    href = `/trees/${_.get(record, 'network.id')}/${prettyIdToIp(
      _.get(record, 'id'),
    )}`;
  }
  if (key === 'hats') {
    href = `/trees/${_.get(record, 'network.id')}/${treeId}`;
  }

  return {
    id: `${key}-${_.get(record, 'id')}-${_.get(record, 'network.id')}`,
    children: `${_.get(record, 'network.name')} - #${prettyIdToIp(
      _.get(record, 'prettyId', _.get(record, 'id')),
    )}`,
    icon: keyIcons[key],
    href,
  };
};

export const searchQueryResult = async (search: string) => {
  if (!search) return { trees: [], hats: [] };

  const promises = _.map(_.keys(chainsList), (chainId: number) =>
    client(chainId).request(SEARCH_QUERY, {
      search: `${search}`, // `%${search}%`,
    }),
  );

  const result = await Promise.all(promises);

  const allNetworkResults: { trees: ITree[]; hats: IHat[] } = {
    trees: [],
    hats: [],
  };
  _.forEach(result, (network, i) => {
    allNetworkResults.trees = _.concat(
      _.map(_.get(network, 'trees'), (tree: ITree) => ({
        ...tree,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.trees || [],
    );
    allNetworkResults.hats = _.concat(
      _.map(_.get(network, 'hats'), (hat: IHat) => ({
        ...hat,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.hats || [],
    );
  });

  return _.mapValues(allNetworkResults, (o, k) =>
    _.map(o, (r) => processForCommandPalette(k, r)),
  );
};
