import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchTreesById } from '@/gql/helpers';
import { isWearingAdminHat } from '@/lib/hats';
import { chainsList } from '@/lib/web3';
import { Hat, Tree } from '@/types';

const chains = _.keys(chainsList);

// hats-hooks
const useHatsAdminOf = ({ hats }: { hats: Hat[] | undefined }) => {
  const adminOfHats = async () => {
    if (!hats) return {};
    // determine the trees to fetch for each network based on the currently worn hats
    const networkTrees: { [key: string]: { trees: (string | undefined)[] } } =
      {};
    _.forEach(chains, (cId: string) => {
      networkTrees[cId] = {
        trees: _.uniq(
          _.map(
            _.filter(hats, (h) => h.chainId === _.toNumber(cId)),
            (h) => h.tree?.id,
          ),
        ),
      };
    });

    const networksWithTrees = _.omitBy(networkTrees, (v) => _.isEmpty(v.trees));
    const networkChains = _.keys(networksWithTrees);

    // fetch the trees for each network
    const promises = _.map(networksWithTrees, (v, k) => {
      const trees = _.filter(v.trees, (t) => t !== undefined) as string[];
      return fetchTreesById(trees, _.toNumber(k));
    });
    const data: unknown[] = await Promise.all(promises);

    // consolidate the associated hats for each tree
    const test = _.map(data, (arr: Tree[], i) =>
      _.flatten(
        _.map(arr, (tree: Tree) =>
          _.map(tree.hats, (h) => ({
            ...h,
            chainId: _.toNumber(networkChains[i]),
          })),
        ),
      ),
    );

    // TODO add another lookup for linked trees/hats
    // filter out the hats that the user is not an admin of
    const filteredAdminHats = _.filter(_.flatten(test), (h: Hat) =>
      isWearingAdminHat(_.map(hats, 'id'), h.id),
    );

    return filteredAdminHats;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['hatsAdminOf', _.map(hats, 'id')],
    queryFn: adminOfHats,
    enabled: !!hats,
  });

  return { data, error, isLoading };
};

export default useHatsAdminOf;
