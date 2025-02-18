import { chainsList } from '@hatsprotocol/config';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { isWearingAdminHat } from 'hats-utils';
import { compact, filter, flatten, forEach, get, isEmpty, keys, map, omitBy, toNumber, uniq } from 'lodash';
import { AppHat } from 'types';
import { fetchTreesByIdMesh } from 'utils';

const chains = keys(chainsList);

type NetworkTrees = { trees: (string | undefined)[] };
type NetworkTreesMap = { [key: string]: NetworkTrees };

// TODO duplicate code from use-admin-of-hats.ts

const useHatsAdminOf = ({ hats }: { hats: AppHat[] | undefined }) => {
  const adminOfHats = async () => {
    if (!hats) return {};
    // determine the trees to fetch for each network based on the currently worn hats
    const networkTrees: NetworkTreesMap = {};
    forEach(chains, (cId: string) => {
      networkTrees[cId] = {
        trees: uniq(
          map(
            filter(hats, (h: AppHat) => h.chainId === toNumber(cId)),
            (h: AppHat) => get(h, 'tree.id'),
          ),
        ),
      };
    });

    const networksWithTrees: NetworkTreesMap = omitBy(networkTrees, (v: NetworkTrees) => isEmpty(v.trees));
    const networkChains = keys(networksWithTrees);

    // fetch the trees for each network
    const promises = map(networksWithTrees, (v: NetworkTrees, k: string) => {
      return fetchTreesByIdMesh(compact(v.trees), toNumber(k));
    });
    const data: unknown[] = await Promise.all(promises);

    // consolidate the associated hats for each tree
    const consolidateTrees = map(data, (arr: Tree[], i: number) =>
      flatten(
        map(arr, (tree: Tree) =>
          map(tree.hats, (h: AppHat) => ({
            ...h,
            chainId: toNumber(networkChains[i]),
          })),
        ),
      ),
    );

    // TODO [md - linked] add another lookup for linked trees/hats
    // filter out the hats that the user is not an admin of
    const filteredAdminHats = filter(flatten(consolidateTrees), (h: AppHat) =>
      isWearingAdminHat(map(hats, 'id'), h.id),
    );

    return filteredAdminHats;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['hatsAdminOf', map(hats, 'id')],
    queryFn: adminOfHats,
    enabled: !!hats,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });

  return { data, error, isLoading };
};

export { useHatsAdminOf };
