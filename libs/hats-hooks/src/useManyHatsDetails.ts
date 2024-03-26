import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';
import { mapWithChainId } from 'shared';
import { AppHat } from 'types';
import { fetchHatDetails } from 'utils';

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
  const onlyOnchainHats: AppHat[] = _.filter(hats, (hat: { id: string }) =>
    _.includes(_.map(initialHats, 'id'), hat.id),
  ) as AppHat[];

  const chainId = _.get(_.first(onlyOnchainHats), 'chainId');
  const hatsDetails = useQueries({
    queries: _.map(
      onlyOnchainHats,
      (hat: { id: string | undefined; chainId: number }) => {
        const hatDetails = _.pick(hat, ['id', 'chainId']);

        return {
          queryKey: ['hatDetails', hatDetails],
          queryFn: () => fetchHatDetails(hat.id, hat.chainId || 5),
          enabled: !!hat.id && !!hat.chainId && hat?.id !== '0x',
          refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
        };
      },
    ) as any[], // UseQueryOptions[]
  });

  const isLoading = _.some(hatsDetails, { isLoading: true });

  let returnData = _.compact(_.map(hatsDetails, 'data'));
  if (chainId) {
    returnData = mapWithChainId(returnData as object[], chainId);
  }

  return {
    data: !isLoading ? (returnData as AppHat[]) : undefined,
    isLoading,
  };
};

export default useManyHatsDetails;
