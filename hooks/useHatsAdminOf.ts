import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { chainsList } from '@/lib/web3';
import { IHat, ITree } from '@/types';
import { GET_TREES_BY_ID } from '@/gql/queries';
import client from '@/gql/client';
import { isAdmin } from '@/lib/hats';

const chains = _.keys(chainsList);

const fetchTreesById = async (treeIds: string[], chainId: number) => {
  const result = await client(chainId).request(GET_TREES_BY_ID, {
    ids: treeIds,
  });

  return _.get(result, 'trees', null);
};

const useHatsAdminOf = ({ hats }: { hats: IHat[] | undefined }) => {
  const adminOfHats = async () => {
    if (!hats) return {};
    // determine the trees to fetch for each network based on the currently worn hats
    const networkTrees: { [key: string]: { trees: string[] } } = {};
    _.forEach(chains, (cId: string) => {
      networkTrees[cId] = {
        trees: _.uniq(
          _.map(
            _.filter(hats, (h) => h.chainId === _.toNumber(cId)),
            (h) => h.tree.id,
          ),
        ),
      };
    });

    const networksWithTrees = _.omitBy(networkTrees, (v) => _.isEmpty(v.trees));
    const networkChains = _.keys(networksWithTrees);

    // fetch the trees for each network
    const promises = _.map(networksWithTrees, (v, k) =>
      fetchTreesById(v.trees, _.toNumber(k)),
    );
    const data: unknown[] = await Promise.all(promises);

    // consolidate the associated hats for each tree
    const test = _.map(data, (arr: ITree[], i) =>
      _.flatten(
        _.map(arr, (tree: ITree) =>
          _.map(tree.hats, (h) => ({
            ...h,
            chainId: _.toNumber(networkChains[i]),
          })),
        ),
      ),
    );
    // TODO add another lookup for linked trees/hats

    // filter out the hats that the user is not an admin of
    const filteredAdminHats = _.filter(_.flatten(test), (h: IHat) =>
      isAdmin(h.prettyId, _.map(hats, 'prettyId')),
    );

    return filteredAdminHats;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['hatsAdminOf', hats],
    queryFn: adminOfHats,
    enabled: !!hats,
  });

  return { data, error, isLoading };
};

export default useHatsAdminOf;
