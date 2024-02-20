import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { AppHat } from 'hats-types';
import { isWearingAdminHat } from 'hats-utils';
import _ from 'lodash';
import { chainsList, fetchTreesById } from 'utils';

const chains = _.keys(chainsList);

type NetworkTrees = { trees: (string | undefined)[] };
type NetworkTreesMap = { [key: string]: NetworkTrees };

const useHatsAdminOf = ({ hats }: { hats: AppHat[] | undefined }) => {
  const adminOfHats = async () => {
    if (!hats) return {};
    // determine the trees to fetch for each network based on the currently worn hats
    const networkTrees: NetworkTreesMap = {};
    _.forEach(chains, (cId: string) => {
      networkTrees[cId] = {
        trees: _.uniq(
          _.map(
            _.filter(hats, (h: AppHat) => h.chainId === _.toNumber(cId)),
            (h: AppHat) => _.get(h, 'tree.id'),
          ),
        ),
      };
    });

    const networksWithTrees: NetworkTreesMap = _.omitBy(
      networkTrees,
      (v: NetworkTrees) => _.isEmpty(v.trees),
    );
    const networkChains = _.keys(networksWithTrees);

    // fetch the trees for each network
    const promises = _.map(networksWithTrees, (v: NetworkTrees, k: string) => {
      return fetchTreesById(_.compact(v.trees), _.toNumber(k));
    });
    const data: unknown[] = await Promise.all(promises);

    // consolidate the associated hats for each tree
    const consolidateTrees = _.map(data, (arr: Tree[], i: number) =>
      _.flatten(
        _.map(arr, (tree: Tree) =>
          _.map(tree.hats, (h: AppHat) => ({
            ...h,
            chainId: _.toNumber(networkChains[i]),
          })),
        ),
      ),
    );

    // TODO [md - linked] add another lookup for linked trees/hats
    // filter out the hats that the user is not an admin of
    const filteredAdminHats = _.filter(
      _.flatten(consolidateTrees),
      (h: AppHat) => isWearingAdminHat(_.map(hats, 'id'), h.id),
    );

    return filteredAdminHats;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['hatsAdminOf', _.map(hats, 'id')],
    queryFn: adminOfHats,
    enabled: !!hats,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });

  return { data, error, isLoading };
};

export default useHatsAdminOf;
