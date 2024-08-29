'use client';

import { useQuery } from '@tanstack/react-query';
import { AppHat } from 'types';
import {
  fetchWearerDetailsForAllChains,
  fetchWearerDetailsForChain,
} from 'utils';
import { Hex } from 'viem';

// hats-hooks
const useWearerDetails = ({
  wearerAddress,
  chainId,
  initialData,
  editMode,
}: UseWearerDetailsProps) => {
  return useQuery({
    queryKey: ['wearerDetails', { wearerAddress, chainId }],
    queryFn: () =>
      chainId && chainId !== 'all'
        ? fetchWearerDetailsForChain(wearerAddress, chainId) as Promise<AppHat[]>
        : fetchWearerDetailsForAllChains(wearerAddress) as Promise<AppHat[]>,
    enabled: !!wearerAddress && !!chainId,
    initialData,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: Hex | undefined;
  initialData?: AppHat[];
  chainId?: number | 'all' | undefined;
  editMode?: boolean;
}
