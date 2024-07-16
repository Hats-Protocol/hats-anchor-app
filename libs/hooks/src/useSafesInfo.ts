import { useQuery } from '@tanstack/react-query';
import { isEmpty, map } from 'lodash';
import { createSafeApiKit } from 'utils';
import { getAddress, Hex } from 'viem';

const fetchSafesInfo = async ({
  safes,
  chainId,
}: {
  safes: Hex[] | undefined;
  chainId: number | undefined;
}) => {
  if (!chainId || isEmpty(safes)) return null;
  const safeKit = createSafeApiKit(BigInt(chainId));

  const promises = map(safes, (s) => safeKit.getSafeInfo(getAddress(s)));

  const result = await Promise.all(promises);
  return result;
};

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
