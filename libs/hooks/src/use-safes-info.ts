import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
// import { fetchSafesInfo } from 'utils';
import { Hex } from 'viem';

const fetchSafesInfoLocal = async ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  console.log('fetchSafesInfoLocal', safes, chainId);
  return fetch(`/api/safe/${chainId}?safes=${safes?.join(',')}`)
    .then((res) => res.json())
    .then((data) => {
      console.log('data', data);
      return data.results;
    });
};

const useSafesInfo = ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  return useQuery({
    queryKey: ['safesTokens', { safes, chainId }],
    queryFn: () => fetchSafesInfoLocal({ safes, chainId }),
    enabled: !isEmpty(safes) && !!chainId,
  });
};

export { useSafesInfo };
