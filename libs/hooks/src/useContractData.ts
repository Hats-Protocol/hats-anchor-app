'use client';

import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { fetchContractData } from 'utils';
import { Hex } from 'viem';

// TODO is this deprecated? Useful on forms?
/**
 * Fetches contract data for a given address from Etherscan
 * @param address address of the evm address
 * @param chainId chainId of the network
 * @param enabled enable the query
 * @param editMode edit mode is used to set the stale time to infinity
 * @returns contract data from Etherscan
 */
const useContractData = ({
  chainId,
  address,
  enabled = true,
  editMode = false,
}: {
  chainId: SupportedChains | undefined;
  address: Hex | undefined;
  enabled?: boolean;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contractData', chainId, address],
    queryFn: () => fetchContractData(chainId, address),
    enabled: !!chainId && !!address && enabled && address !== FALLBACK_ADDRESS,
    staleTime: editMode ? Infinity : 1000 * 60 * 60 * 24, // 24 hours
  });

  return { data, isLoading, error };
};

export default useContractData;
