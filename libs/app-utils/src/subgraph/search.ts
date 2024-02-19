/* eslint-disable import/prefer-default-export */
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { IconName } from 'react-cmdk';
import { idToIp } from 'shared';
import { hexToNumber } from 'viem';

import { chainsList, createSubgraphClient } from '../web3';

const keyIcons: { [key: string]: string } = {
  trees: 'UserGroupIcon',
  hats: 'UserPlusIcon',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processForCommandPalette = (key: string, record: any) => {
  const { id: recordId, network } = record;
  const { id: networkId, name: networkName } = network || {};

  let treeId;
  let href;
  let label;
  if (key === 'trees') {
    treeId = hexToNumber(recordId, { size: 8 });
  }
  const id = `${key}-${recordId}-${networkId}`;
  const hatIdIp = idToIp(recordId);
  const icon = keyIcons[key] as IconName;

  // eslint-disable-next-line default-case
  switch (key) {
    case 'trees':
      href = `/trees/${networkId}/${treeId}`;
      label = `Tree #${treeId} on ${networkName}`;
      break;
    case 'hats':
      href = `/trees/${networkId}/${treeId}?hatId=${hatIdIp}`;
      label = `Hat #${hatIdIp} on ${networkName}`;
      break;
    default:
      href = '#';
      label = '';
  }

  return { id, children: label, icon, href };
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
      .catch((e) => console.error(e)),
  );

  const result = await Promise.all(promises);

  // sort
  const allNetworkResults: { trees: Tree[]; hats: AppHat[] } = {
    trees: [],
    hats: [],
  };
  _.forEach(result, (network: any, i: number) => {
    allNetworkResults.trees = _.concat(
      _.map(_.get(network, 'trees'), (tree: Tree) => ({
        ...tree,
        // id: hexToNumber(tree.id, { size: 8 }),
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.trees || [],
    );
    allNetworkResults.hats = _.concat(
      _.map(_.get(network, 'hats'), (hat: AppHat) => ({
        ...hat,
        network: _.values(chainsList)[i],
      })),
      allNetworkResults?.hats || [],
    );
  });
  // TODO seeing results here, but not in command palette
  console.log('allNetworkResults', allNetworkResults);

  return _.mapValues(
    allNetworkResults,
    (
      o: {
        trees: Tree[];
        hats: AppHat[];
      },
      k: any,
    ) => _.map(o, (r: any) => processForCommandPalette(k, r)),
  );
};
