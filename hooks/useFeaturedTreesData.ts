import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchTreeDetails, fetchTreesById } from '@/gql/helpers';
import { ipToPrettyId, prettyIdToIp } from '@/lib/hats';
import { ITree } from '@/types';

const useFeaturedTreesData = (featuredTrees: any) => {
  const fetchFeaturedTrees = async () => {
    const ids = _.map(featuredTrees, (tree) => ipToPrettyId(String(tree.id)));

    const [opTrees, gnoTrees] = await Promise.all([
      fetchTreesById([ids[0], ids[2]], 10),
      fetchTreeDetails(ids[1], 100),
    ]);

    const trees = _.concat(opTrees, gnoTrees) as ITree[];

    const data = _.map(trees, (tree) => ({
      treeId: prettyIdToIp(tree.id),
      hats: tree.hats.length,
      wearers: _.sum(_.map(tree.hats, (hat) => hat.wearers.length)),
    }));

    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTreesData'],
    queryFn: fetchFeaturedTrees,
    enabled: !!featuredTrees,
  });

  return { data, isLoading };
};

export default useFeaturedTreesData;
