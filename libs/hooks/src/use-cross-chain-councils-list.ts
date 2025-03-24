import { useQuery } from '@tanstack/react-query';
import { HatSignerGateV2 } from 'types';
import { getCrossChainCouncilsListData, logger } from 'utils';

interface UseCrossChainCouncilsListProps {
  hatIds?: string[];
  enabled?: boolean;
  useDynamicQuery?: boolean;
}

export const useCrossChainCouncilsList = ({
  hatIds,
  enabled = true,
  useDynamicQuery = false,
}: UseCrossChainCouncilsListProps) => {
  logger.info('hatIds in hook', hatIds);
  return useQuery<Record<string, HatSignerGateV2[]> | null>({
    queryKey: ['crossChainCouncilsList', { hatIds, useDynamicQuery }],
    queryFn: () => getCrossChainCouncilsListData(hatIds, useDynamicQuery),
    enabled: enabled && !!hatIds?.length,
  });
};
