/* eslint-disable import/prefer-default-export */
import { FEATURED_TREES } from '@hatsprotocol/constants';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';
import { prettyIdToIp } from 'shared';
import { AppHat } from 'types';

import { removeInactiveHatsAndDescendants } from './hats';
import { ipfsUrl } from './image';
import { fetchTreeDetailsMesh, fetchTreesByIdMesh } from './subgraph';

export const fetchFeaturedTreesData = async ({
  featuredTrees,
}: {
  featuredTrees: any[];
}) => {
  const chainIds = _.uniq(_.map(featuredTrees, 'chainId'));

  const promises = _.map(chainIds, (chainId: number) => {
    const trees = _.filter(featuredTrees, { chainId });
    if (_.size(trees) > 1) {
      return fetchTreesByIdMesh(_.map(trees, 'id'), chainId);
    }

    return fetchTreeDetailsMesh(_.first(trees).id, chainId);
  });

  const result = await Promise.all(_.flatten(promises));

  const data = _.map(_.flatten(result), (tree: Tree) => {
    const onlyActiveHats = removeInactiveHatsAndDescendants(tree.hats);
    return {
      treeId: prettyIdToIp(tree.id),
      hats: _.size(onlyActiveHats),
      // try to get unique wearers across active hats
      // TODO doesn't account well for hats with many (100+) wearers
      wearers: _.size(
        _.uniq(_.flatten(_.map(onlyActiveHats, (hat: AppHat) => hat.wearers))),
      ),
    };
  });

  return data;
};

export const fetchFeaturedTrees = () => FEATURED_TREES({ ipfsUrl });
