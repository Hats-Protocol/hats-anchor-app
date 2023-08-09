import _ from 'lodash';
import { useEffect, useState } from 'react';

import {
  fetchHatDetails,
  fetchManyHatDetails,
  fetchTreeDetails,
} from '@/gql/helpers';
import { ipToPrettyId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import { IHat, ITree } from '@/types';

import { fetchTreesById } from './useHatsAdminOf';

const useFeaturedTrees = (featuredTrees: any) => {
  const [hatsAndWearers, setHatsAndWearers] = useState<any>([]);

  useEffect(() => {
    const fetchFeaturedTrees = async () => {
      const ids = _.map(featuredTrees, (tree) => ipToPrettyId(String(tree.id)));

      const [trees1, tree3] = await Promise.all([
        fetchTreesById([ids[0], ids[2]], 10),
        fetchTreeDetails(ids[1], 100),
        // fetchManyHatDetails([prettyIdToId(ids[0]), prettyIdToId(ids[2])], 10),
        // fetchHatDetails(prettyIdToId(ids[1]), 100),
      ]);

      const trees = [...(trees1 || []), ...[tree3]] as ITree[];
      // const hats = [...(hats1 || []), ...[hat3]] as IHat[];

      const data = _.map(trees, (tree) => ({
        treeId: prettyIdToIp(tree.id),
        hats: tree.hats.length,
        wearers: _.sum(_.map(tree.hats, (hat) => hat.wearers.length)),
      }));

      // const wearers = _.map(hats, (hat) => ({
      //   treeId: prettyIdToIp(hat.prettyId),
      //   wearers: Number(hat.wearers.length),
      // }));
      // console.log('wearers', wearers);

      // const data = _.map(hatsOfTrees, (tree) => ({
      //   ...tree,
      //   ..._.find(wearers, { treeId: tree.treeId }),
      // }));
      // console.log(data);

      setHatsAndWearers(data);
    };

    fetchFeaturedTrees();
  }, [featuredTrees]);

  return hatsAndWearers;
};

export default useFeaturedTrees;
