import { useQuery } from '@tanstack/react-query';
import { fetchPendingSafeTransactions, fetchSafeTransactions } from 'utils';
import { Hex } from 'viem';

const useSafeTransactions = ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['safeTransactions', safeAddress, chainId],
    queryFn: () => fetchSafeTransactions({ safeAddress, chainId }),
    enabled: !!safeAddress && !!chainId,
  });
};

const usePendingSafeTransactions = ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['pendingSafeTransactions', safeAddress, chainId],
    queryFn: () => fetchPendingSafeTransactions({ safeAddress, chainId }),
    enabled: !!safeAddress && !!chainId,
  });
};

export { usePendingSafeTransactions, useSafeTransactions };
