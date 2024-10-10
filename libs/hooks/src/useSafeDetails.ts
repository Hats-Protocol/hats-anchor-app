import { SAFE_ABI } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { viemPublicClient } from 'utils';
import { Hex } from 'viem';

const fetchSafeDetails = async (
  safeAddress: Hex,
  chainId: SupportedChains,
): Promise<Hex[]> => {
  // COULD USE SAFE SDK/API, BUT PREFERRING CONTRACT READS HERE
  // const response = await fetch(
  //   `https://safe-transaction.mainnet.gnosis.io/api/v1/safes/${safeAddress}/`,
  // );
  // const data = await response.json();
  // return data;

  const client = viemPublicClient(chainId);

  const result = await client.readContract({
    address: safeAddress,
    abi: SAFE_ABI,
    functionName: 'getOwners',
  });

  return Promise.resolve(result as Hex[]);
};

const useSafeDetails = ({
  safeAddress,
  chainId,
  enabled = true,
  editMode = false,
}: {
  safeAddress: Hex | undefined;
  chainId: SupportedChains | undefined;
  enabled?: boolean;
  editMode?: boolean;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['safeDetails', { safeAddress, chainId }],
    queryFn: () =>
      chainId && safeAddress && fetchSafeDetails(safeAddress, chainId),
    enabled: !!safeAddress && !!chainId && !!enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15,
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useSafeDetails;
