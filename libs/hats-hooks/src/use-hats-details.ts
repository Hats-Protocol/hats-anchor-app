import { useQueries } from '@tanstack/react-query';
import { compact, flatten, groupBy, map, toNumber } from 'lodash';
import { AppHat } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

const useHatsDetails = ({ hats }: { hats: Partial<AppHat>[] }) => {
  const hatsByChain = groupBy(hats, 'chainId');

  const result = useQueries({
    queries: map(hatsByChain, (hats, chainId) => ({
      queryKey: ['hatDetails', chainId, map(hats, 'id')],
      queryFn: () => fetchHatsDetailsMesh(compact(map(hats, 'id')), toNumber(chainId)),
    })),
  });

  return {
    data: compact(flatten(result.map((r) => r.data))),
    isLoading: result.some((r) => r.isLoading),
  };
};

export { useHatsDetails };
