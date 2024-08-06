import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash';
import { getAddress, Hex } from 'viem';

const fetchSafeTransactions = async ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  if (!safeAddress || !chainId) return null;
  // use appropriate URL
  return fetch(
    `https://safe-transaction-gnosis-chain.safe.global/api/v1/safes/${getAddress(
      safeAddress,
    )}/all-transactions/`,
  )
    .then((res) => res.json())
    .then((data) => get(data, 'results'));
};

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

export default useSafeTransactions;
