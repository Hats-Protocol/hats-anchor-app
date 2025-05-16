import { useQuery } from '@tanstack/react-query';
import { compact, isEmpty, size } from 'lodash';
import { logger } from 'utils';
import { Hex } from 'viem';

const fetchSafesInfoLocal = async ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  if (!safes || size(compact(safes)) === 0) {
    return null;
  }
  return fetch(`/api/safe/${chainId}?safes=${safes?.join(',')}`)
    .then((res) => res.json())
    .then((data) => {
      return (data || null) as Hex[] | null;
    })
    .catch((error) => {
      logger.error('fetchSafesInfoLocal', error);
      return null;
    });
};

const useSafesInfo = ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  return useQuery({
    queryKey: ['safesInfo', { safes, chainId }],
    queryFn: () => fetchSafesInfoLocal({ safes, chainId }),
    enabled: !!safes && !isEmpty(safes) && !!chainId,
  });
};

export { useSafesInfo };
