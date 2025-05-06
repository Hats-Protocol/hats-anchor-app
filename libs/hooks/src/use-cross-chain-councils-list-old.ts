import { useQuery } from '@tanstack/react-query';
import { HatSignerGateV2 } from 'types';
import { getCrossChainCouncilsListData } from 'utils';

interface UseCrossChainCouncilsListProps {
  hatIds?: string[];
  enabled?: boolean;
  useDynamicQuery?: boolean;
}

export const useCrossChainCouncilsListOld = ({
  hatIds,
  enabled = true,
  useDynamicQuery = false,
}: UseCrossChainCouncilsListProps) => {
  return useQuery<Record<string, HatSignerGateV2[]> | null>({
    queryKey: ['crossChainCouncilsList', { hatIds, useDynamicQuery }],
    queryFn: () =>
      getCrossChainCouncilsListData(hatIds, useDynamicQuery) as Promise<Record<string, HatSignerGateV2[]> | null>,
    enabled: enabled && !!hatIds?.length,
  });
};
