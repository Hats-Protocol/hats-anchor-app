import { useQuery } from '@tanstack/react-query';
import { getCrossChainWearerDetails } from 'utils';

interface UseCrossChainWearerProps {
  wearerAddress?: string;
  enabled?: boolean;
}

export const useCrossChainWearer = ({ wearerAddress, enabled = true }: UseCrossChainWearerProps) => {
  return useQuery({
    queryKey: ['crossChainWearer', { wearerAddress }],
    queryFn: () => getCrossChainWearerDetails(wearerAddress),
    enabled: enabled && !!wearerAddress,
  });
};
