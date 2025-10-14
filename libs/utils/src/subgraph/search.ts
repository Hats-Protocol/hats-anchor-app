import { chainsList } from '@hatsprotocol/config';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';
import { IconName } from 'react-cmdk';
import { idToIp } from 'shared';
import { AppHat, AppTree } from 'types';
import { hexToNumber } from 'viem';

import { createMeshClient } from '../mesh/helpers';
import { getCrossChainSearchQuery, NETWORKS_PREFIX } from './mesh/queries';

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

  try {
    const meshClient = createMeshClient();
    const query = getCrossChainSearchQuery();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await meshClient.request(query, {
      searchId: search,
      searchString: search,
    });

    // Parse the response and organize by chain
    const allNetworkResults: { trees: any[]; hats: AppHat[] } = {
      trees: [],
      hats: [],
    };

    // Iterate through each network prefix and extract results
    _.forEach(Object.entries(NETWORKS_PREFIX), ([chainIdStr, prefix]) => {
      const chainId = parseInt(chainIdStr);
      const network = _.values(chainsList).find((chain) => chain.id === chainId);

      if (!network) return;

      // Extract trees for this network
      const trees = _.get(response, `${prefix}_trees`, []) as Tree[];
      allNetworkResults.trees = _.concat(
        _.map(trees, (tree: Tree) => ({
          ...tree,
          network,
        })),
        allNetworkResults.trees,
      );

      // Extract hats for this network
      const hats = _.get(response, `${prefix}_hats`, []) as AppHat[];
      allNetworkResults.hats = _.concat(
        _.map(hats, (hat: AppHat) => ({
          ...hat,
          treeId: _.get(hat, 'tree.id'),
          network,
        })),
        allNetworkResults.hats,
      );
    });

    // TODO sort these results

    return _.mapValues(allNetworkResults, (o: { trees: AppTree[]; hats: AppHat[] }, k: string) =>
      _.map(o, (r: AppHat | AppTree) => processForCommandPalette(k, r)),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error in cross-chain search:', e);
    return { trees: [], hats: [] };
  }
};
