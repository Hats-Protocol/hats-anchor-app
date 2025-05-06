import { useQuery } from '@tanstack/react-query';
import { getCrossChainAllowlistEligibilities } from 'utils';

interface UseCrossChainAllowlistProps {
  address?: string;
  enabled?: boolean;
}

export const useCrossChainAllowlist = ({ address, enabled = true }: UseCrossChainAllowlistProps) => {
  return useQuery({
    queryKey: ['crossChainAllowlist', { address }],
    queryFn: () => getCrossChainAllowlistEligibilities(address),
    enabled: enabled && !!address,
    refetchOnMount: true,
    staleTime: 0,
  });
};
