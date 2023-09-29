import { useQuery } from '@tanstack/react-query';
import { Hex } from 'viem';

import {
  fetchWearerDetailsForAllChains,
  fetchWearerDetailsForChain,
} from '@/gql/helpers';
import { Hat } from '@/types';

const useWearerDetails = ({
  wearerAddress,
  chainId,
  initialData,
}: UseWearerDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress, { chainId }],
    queryFn: () =>
      chainId && chainId !== 'all'
        ? fetchWearerDetailsForChain(wearerAddress, chainId)
        : fetchWearerDetailsForAllChains(wearerAddress),
    enabled: !!wearerAddress && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: Hex | undefined;
  initialData?: Hat[];
  chainId?: number | 'all' | undefined;
}
