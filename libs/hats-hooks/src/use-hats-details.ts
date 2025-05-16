import { useQueries } from '@tanstack/react-query';
import { compact, flatten, groupBy, map, toNumber } from 'lodash';
import { AppHat } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

const useHatsDetails = ({ hats }: { hats: Partial<AppHat>[] }) => {
  const hatsByChain = groupBy(hats, 'chainId');

  const result = useQueries({
    queries: map(hatsByChain, (hats, chainId) => ({
      queryKey: ['hatsByChainDetails', chainId, map(hats, 'id')],
      queryFn: () => fetchHatsDetailsMesh(compact(map(hats, 'id')), toNumber(chainId)),
    })),
  });

  // TODO would it be wise to cache these to the `hatDetails` cache also?

  return {
    data: compact(flatten(result.map((r) => r.data))),
    isLoading: result.some((r) => r.isLoading),
  };
};

export { useHatsDetails };
