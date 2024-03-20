import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { prettyIdToIp } from 'shared';
import { AppHat } from 'types';
import {
  fetchTreeDetails,
  fetchTreesById,
  removeInactiveHatsAndDescendants,
} from 'utils';

// TODO doesn't account well for hats with many (100+) wearers

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFeaturedTreesData = (featuredTrees: any) => {
  const fetchFeaturedTrees = async () => {
    const chainIds = _.uniq(_.map(featuredTrees, 'chainId'));

    const promises = _.map(chainIds, (chainId: number) => {
      const trees = _.filter(featuredTrees, { chainId });
      if (_.size(trees) > 1) {
        return fetchTreesById(_.map(trees, 'id'), chainId);
      }

      return fetchTreeDetails(_.first(trees).id, chainId);
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
          _.uniq(
            _.flatten(_.map(onlyActiveHats, (hat: AppHat) => hat.wearers)),
          ),
        ),
      };
    });

    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTreesData'],
    queryFn: fetchFeaturedTrees,
    enabled: !!featuredTrees,
    staleTime: 1_000_000,
  });

  return { data, isLoading };
};

export default useFeaturedTreesData;
