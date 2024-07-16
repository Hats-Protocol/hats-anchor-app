import { useQuery } from '@tanstack/react-query';
import { getAddress, Hex } from 'viem';

const fetchSafeTokens = async (
  safeAddress: Hex | undefined,
  chainId: number | undefined,
) => {
  if (!safeAddress || !chainId) return null;
  // use appropriate URL
  return fetch(
    `https://safe-transaction-gnosis-chain.safe.global/api/v2/safes/${getAddress(
      safeAddress,
    )}/balances`,
  )
    .then((res) => res.json())
    .then((data) => data.results);
};

const useSafeTokens = ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['safe-tokens', safeAddress, chainId],
    queryFn: () => fetchSafeTokens(safeAddress, chainId),
    enabled: !!safeAddress && !!chainId,
  });
};

export default useSafeTokens;
