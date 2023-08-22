import _ from 'lodash';
import { useEffect, useState } from 'react';

import { fetchTreeDetails } from '@/gql/helpers';
import { ipToPrettyId, prettyIdToIp } from '@/lib/hats';
import { ITree } from '@/types';

import { fetchTreesById } from './useHatsAdminOf';

const useFeaturedTrees = (featuredTrees: any) => {
  const [hatsAndWearers, setHatsAndWearers] = useState<any>([]);

  useEffect(() => {
    const fetchFeaturedTrees = async () => {
      const ids = _.map(featuredTrees, (tree) => ipToPrettyId(String(tree.id)));

      const [trees1, tree3] = await Promise.all([
        fetchTreesById([ids[0], ids[2]], 10),
        fetchTreeDetails(ids[1], 100),
      ]);

      const trees = [...(trees1 || []), ...[tree3]] as ITree[];

      const data = _.map(trees, (tree) => ({
        treeId: prettyIdToIp(tree.id),
        hats: tree.hats.length,
        wearers: _.sum(_.map(tree.hats, (hat) => hat.wearers.length)),
      }));

      setHatsAndWearers(data);
    };

    fetchFeaturedTrees();
  }, [featuredTrees]);

  return hatsAndWearers;
};

export default useFeaturedTrees;
