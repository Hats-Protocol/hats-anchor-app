/* eslint-disable import/prefer-default-export */
import { Hat, Tree } from 'hats-types';
import _ from 'lodash';
import { IconName } from 'react-cmdk';
import { idToPrettyId, prettyIdToIp, toTreeId } from 'shared-utils';
import { Hex } from 'viem';

import { chainsList, createSubgraphClient } from '../web3';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processForCommandPalette = (key: string, record: any) => {
  const { id, network, prettyId } = record;
  const { id: networkId, name: networkName } = network || {};

  const parts = id?.split('.');
  const treeId = parts ? BigInt(toTreeId(parts[0] as Hex)) : '';

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

export const searchQueryResult = async (search: string | undefined) => {
  if (!search) return { trees: [], hats: [] };

  const subgraphClient = createSubgraphClient();

  const promises = _.map(_.keys(chainsList), (chainId: number) =>
    subgraphClient.searchTreesHatsWearers({
      chainId,
      search,
      treeProps: {},
      hatProps: {
        prettyId: true,
      },
      wearerProps: {},
    }),
  );

  // TODO surface errors, but don't fail all calls
  const result = await Promise.all(promises);

  const allNetworkResults: { trees: Tree[]; hats: Hat[] } = {
    trees: [],
    hats: [],
  };
  _.forEach(result, (network: any, i: number) => {
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

  return _.mapValues(
    allNetworkResults,
    (
      o: {
        trees: Tree[];
        hats: Hat[];
      },
      k: any,
    ) => _.map(o, (r: any) => processForCommandPalette(k, r)),
  );
};
