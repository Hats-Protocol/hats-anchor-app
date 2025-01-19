import { useQuery } from '@tanstack/react-query';
import { filter, first, get, includes, isEmpty, map } from 'lodash';
import { mapWithChainId } from 'shared';
import { AppHat } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

// TODO handle as a single cache

const useManyHatsDetails = ({
  hats,
  initialHats,
  editMode = false,
}: {
  hats: Partial<AppHat>[] | undefined;
  initialHats?: Partial<AppHat>[];
  editMode?: boolean;
}): { data: AppHat[] | undefined; isLoading: boolean } => {
  const onlyOnchainHats: AppHat[] = filter(hats, (hat: { id: string }) =>
    includes(map(initialHats, 'id'), hat.id),
  ) as AppHat[];
  const onlyOnchainHatsIds = map(onlyOnchainHats, 'id');

  const chainId = get(first(onlyOnchainHats), 'chainId');

  const { data, isLoading } = useQuery({
    queryKey: ['hatDetails', onlyOnchainHatsIds, chainId],
    queryFn: () => fetchHatsDetailsMesh(onlyOnchainHatsIds, chainId),
    enabled: !isEmpty(onlyOnchainHatsIds) && !!chainId,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 5,
  });

  return {
    data: chainId ? (mapWithChainId(data || undefined, chainId) as AppHat[]) : undefined,
    isLoading,
  };
};

export { useManyHatsDetails };
