import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails, fetchTreesById } from 'app-utils';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { ipToPrettyId, prettyIdToIp } from 'shared-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFeaturedTreesData = (featuredTrees: any) => {
  const fetchFeaturedTrees = async () => {
    const ids = _.map(featuredTrees, (tree: Tree) =>
      ipToPrettyId(String(tree.id)),
    );

    const [opTrees, gnoTrees] = await Promise.all([
      fetchTreesById([ids[0], ids[2]], 10),
      fetchTreeDetails(ids[1], 100),
    ]);

    const trees = _.concat(opTrees, gnoTrees) as Tree[];

    const data = _.map(trees, (tree: Tree) => ({
      treeId: prettyIdToIp(tree.id),
      hats: _.size(tree.hats),
      wearers: _.sum(_.map(tree.hats, (hat: AppHat) => _.size(hat.wearers))),
    }));

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
