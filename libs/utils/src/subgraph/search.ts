/* eslint-disable import/prefer-default-export */
import { chainsList } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';
import { IconName } from 'react-cmdk';
import { idToIp } from 'shared';
import { AppHat, AppTree } from 'types';
import { hexToNumber } from 'viem';

import { createSubgraphClient } from '../web3';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

const processForCommandPalette = (key: string, record: any) => {
  const { id: recordId, network } = _.pick(record, ['id', 'network']);
  const { id: networkId, name: networkName } = network || {};

  const id = `${key}-${recordId}-${networkId}`;
  const hatIdIp = idToIp(recordId);
  const icon = keyIcons[key] as IconName;
  let treeId;
  const DEFAULT_RESULT = { id, children: '', icon, href: '#' };

  if (!network || !recordId) return DEFAULT_RESULT;

  switch (key) {
    case 'trees':
      treeId = hexToNumber(recordId, { size: 8 });
      return {
        id,
        children: `Tree #${treeId} on ${networkName}`,
        icon,
        href: `/trees/${networkId}/${treeId}`,
      };

    case 'hats':
      treeId = hatIdToTreeId(BigInt(recordId));
      return {
        id,
        children: `Hat #${hatIdIp} on ${networkName}`,
        icon,
        href: `/trees/${networkId}/${treeId}?hatId=${hatIdIp}`,
      };

    default:
      return DEFAULT_RESULT;
  }
};

export const searchQueryResult = async (search: string | undefined) => {
  if (!search) return { trees: [], hats: [] };

  const subgraphClient = createSubgraphClient();

  const promises = _.map(_.keys(chainsList), (chainId: number) =>
    subgraphClient
      .searchTreesHatsWearers({
        chainId,
        search,
        treeProps: {},
        hatProps: {
          prettyId: true,
        },
        wearerProps: {},
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e)),
  );

  const result = await Promise.all(promises);

  // sort
  const allNetworkResults: { trees: any[]; hats: AppHat[] } = {
    trees: [],
    hats: [],
  };
  _.forEach(result, (network: unknown, i: number) => {
    const localNetwork = _.get(network, 'trees') as Tree[] | undefined;
    allNetworkResults.trees = _.concat(
      _.map(localNetwork, (tree: Tree) => ({
        ...tree,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.trees || [],
    );
    allNetworkResults.hats = _.concat(
      _.map(_.get(network, 'hats'), (hat: AppHat) => ({
        ...hat,
        treeId: _.get(hat, 'tree.id'),
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.hats || [],
    );
  });
  // TODO sort these results

  return _.mapValues(
    allNetworkResults,
    (o: { trees: AppTree[]; hats: AppHat[] }, k: string) =>
      _.map(o, (r: AppHat | AppTree) => processForCommandPalette(k, r)),
  );
};
