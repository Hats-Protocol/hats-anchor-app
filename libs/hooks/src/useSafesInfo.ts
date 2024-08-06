import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { fetchSafesInfo } from 'utils';
import { Hex } from 'viem';

const useSafesInfo = ({
  safes,
  chainId,
}: {
  safes: Hex[] | undefined;
  chainId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['safesTokens', { safes, chainId }],
    queryFn: () => fetchSafesInfo({ safes, chainId }),
    enabled: !isEmpty(safes) && !!chainId,
  });
};

export default useSafesInfo;
