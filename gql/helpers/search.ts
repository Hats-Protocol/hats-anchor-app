/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { IconName } from 'react-cmdk';
import { Hex } from 'viem';

import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import { chainsList } from '@/lib/web3';
import { Hat, Tree } from '@/types';

import client from '../client';
import { SEARCH_QUERY } from '../queries';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processForCommandPalette = (key: string, record: any) => {
  const { id, network, prettyId } = record;
  const { id: networkId, name: networkName } = network || {};

  const parts = id?.split('.');
  const treeId = parts ? prettyIdToIp(idToPrettyId(parts[0] as Hex)) : '';

  let href = '#';
  const ip = prettyIdToIp(prettyId || id);
  const hatIdIp = prettyIdToIp(idToPrettyId(id));

  // eslint-disable-next-line default-case
  switch (key) {
    case 'trees':
      href = `/trees/${networkId}/${ip}`;
      break;
    case 'hats':
      href = `/trees/${networkId}/${treeId}?hatId=${hatIdIp}`;
      break;
  }

  const children = `${networkName} - #${ip}`;
  const icon = keyIcons[key] as IconName;

  return {
    id: `${key}-${id}-${networkId}`,
    children,
    icon,
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

  const allNetworkResults: { trees: Tree[]; hats: Hat[] } = {
    trees: [],
    hats: [],
  };
  _.forEach(result, (network, i) => {
    allNetworkResults.trees = _.concat(
      _.map(_.get(network, 'trees'), (tree: Tree) => ({
        ...tree,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.trees || [],
    );
    allNetworkResults.hats = _.concat(
      _.map(_.get(network, 'hats'), (hat: Hat) => ({
        ...hat,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.hats || [],
    );
  });

  console.log('allNetworkResults', allNetworkResults);
  return _.mapValues(allNetworkResults, (o, k) =>
    _.map(o, (r) => processForCommandPalette(k, r)),
  );
};
