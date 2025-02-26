import { useQuery } from '@tanstack/react-query';
import { isEmpty, size } from 'lodash';
import { Hex } from 'viem';

const fetchSafesInfoLocal = async ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  if (!safes || size(safes) === 0) {
    return [];
  }
  return fetch(`/api/safe/${chainId}?safes=${safes?.join(',')}`)
    .then((res) => res.json())
    .then((data) => {
      return data;
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
