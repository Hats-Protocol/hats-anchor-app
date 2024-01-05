import { useQuery } from '@tanstack/react-query';
import {
  fetchWearerDetailsForAllChains,
  fetchWearerDetailsForChain,
} from 'app-utils';
import { AppHat } from 'hats-types';
import { Hex } from 'viem';

// hats-hooks
const useWearerDetails = ({
  wearerAddress,
  chainId,
  initialData,
  editMode,
}: UseWearerDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress, { chainId }],
    queryFn: () =>
      chainId && chainId !== 'all'
        ? fetchWearerDetailsForChain(wearerAddress, chainId)
        : fetchWearerDetailsForAllChains(wearerAddress),
    enabled: !!wearerAddress && !!chainId,
    initialData,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: Hex | undefined;
  initialData?: AppHat[];
  chainId?: number | 'all' | undefined;
  editMode?: boolean;
}
