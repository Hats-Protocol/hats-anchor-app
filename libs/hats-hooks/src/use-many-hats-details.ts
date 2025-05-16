import { useQuery } from '@tanstack/react-query';
import { compact, filter, first, get, includes, isEmpty, map } from 'lodash';
import { mapWithChainId } from 'shared';
import { AppHat, SupportedChains } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

// TODO handle as a single cache

/**
 * Fetches details for a list of hats on a single chain
 * @param hats
 * @param initialHats
 * @param editMode
 * @param chainId
 * @returns A list of hats with details and loading state
 */
const useManyHatsDetails = ({
  hats,
  initialHats,
  editMode = false,
  chainId,
}: {
  hats: Partial<AppHat>[] | undefined;
  initialHats?: Partial<AppHat>[];
  editMode?: boolean;
  chainId?: SupportedChains | undefined;
}): { data: AppHat[] | undefined; isLoading: boolean } => {
  const onlyOnchainHats: AppHat[] = filter(hats, (hat: { id: string }) =>
    includes(map(initialHats, 'id'), hat.id),
  ) as AppHat[];
  const hatIds = map(hats, 'id');
  const onlyOnchainHatsIds = map(onlyOnchainHats, 'id');

  const localHatIds = initialHats ? onlyOnchainHatsIds : compact(hatIds);
  const localChainId = chainId || get(first(onlyOnchainHats), 'chainId');

  const { data, isLoading } = useQuery({
    queryKey: ['hatDetails', { localHatIds, localChainId }],
    queryFn: () => fetchHatsDetailsMesh(localHatIds, localChainId),
    enabled: !isEmpty(localHatIds) && !!localChainId,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 5,
  });

  return {
    data: localChainId ? (mapWithChainId(data || undefined, localChainId) as AppHat[]) : undefined,
    isLoading,
  };
};

export { useManyHatsDetails };
