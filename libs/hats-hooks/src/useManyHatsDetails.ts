import { useQueries } from '@tanstack/react-query';
import { fetchHatDetails } from 'app-utils';
import { Hat } from 'hats-types';
import _ from 'lodash';
import { mapWithChainId } from 'shared-utils';

// hats-hooks
const useManyHatsDetails = ({
  hats,
  initialHats,
  editMode = false, // TODO is this a bad default?
}: {
  hats: Partial<Hat>[] | undefined;
  initialHats?: Partial<Hat>[];
  editMode?: boolean;
}): { data: Hat[] | undefined; isLoading: boolean } => {
  const onlyOnchainHats = _.filter(hats, (hat: { id: any }) =>
    _.includes(_.map(initialHats, 'id'), hat.id),
  );

  const chainId = _.get(_.first(onlyOnchainHats), 'chainId');
  const hatsDetails = useQueries({
    queries: _.map(
      onlyOnchainHats,
      (hat: { id: string | undefined; chainId: any }) => {
        const hatDetails = _.pick(hat, ['id', 'chainId']);

        return {
          queryKey: ['hatDetails', hatDetails],
          queryFn: () => fetchHatDetails(hat.id, hat.chainId || 5),
          enabled: !!hat.id && !!hat.chainId,
          refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
        };
      },
    ) as any,
  });

  const isLoading = _.some(hatsDetails, ['isLoading', true]);

  let returnData = _.compact(_.map(hatsDetails, 'data'));
  if (chainId) {
    returnData = mapWithChainId(returnData as object[], chainId);
  }

  return {
    data: !isLoading ? (returnData as Hat[]) : undefined,
    isLoading,
  };
};

export default useManyHatsDetails;
