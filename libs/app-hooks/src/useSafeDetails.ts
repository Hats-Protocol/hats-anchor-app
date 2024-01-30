import { useQuery } from '@tanstack/react-query';
import { SAFE_ABI } from 'app-constants';
import { viemPublicClient } from 'app-utils';
import { SupportedChains } from 'hats-types';
import { Hex } from 'viem';

const fetchSafeDetails = async (safeAddress: Hex, chainId: SupportedChains) => {
  // COULD USE SAFE SDK/API, BUT PREFERRING CONTRACT READS HERE
  // const response = await fetch(
  //   `https://safe-transaction.mainnet.gnosis.io/api/v1/safes/${safeAddress}/`,
  // );
  // const data = await response.json();
  // return data;

  const client = viemPublicClient(chainId);

  const result = client.readContract({
    address: safeAddress,
    abi: SAFE_ABI,
    functionName: 'getOwners',
  });

  return result;
};

const useSafeDetails = ({
  safeAddress,
  chainId,
  enabled = true,
}: {
  safeAddress: Hex;
  chainId: SupportedChains;
  enabled?: boolean;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['safeDetails', { safeAddress, chainId }],
    queryFn: () => fetchSafeDetails(safeAddress, chainId),
    enabled: !!safeAddress && !!chainId && !!enabled,
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useSafeDetails;
