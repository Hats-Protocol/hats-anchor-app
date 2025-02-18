import { useQuery } from '@tanstack/react-query';
import { fetchSafeTokens } from 'utils';
import { Hex } from 'viem';

const useSafeTokens = ({ safeAddress, chainId }: { safeAddress: Hex | undefined; chainId: number | undefined }) => {
  return useQuery({
    queryKey: ['safeTokens', safeAddress, chainId],
    queryFn: () => fetchSafeTokens(safeAddress, chainId),
    enabled: !!safeAddress && !!chainId,
  });
};

export { useSafeTokens };
