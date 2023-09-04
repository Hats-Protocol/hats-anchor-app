import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchHatDetails } from '@/gql/helpers';
import { mapWithChainId } from '@/lib/general';
import { IHat } from '@/types';

const useManyHatDetails = ({
  hats,
  initialHats,
}: {
  hats: Partial<IHat>[] | undefined;
  initialHats?: IHat[];
}): IHat[] => {
  const chainId = _.get(_.first(hats), 'chainId');
  const hatsDetails = useQueries({
    queries: _.map(hats, (hat) => ({
      queryKey: ['hatDetails', hat.id, hat.chainId],
      queryFn: () => fetchHatDetails(hat.id, hat.chainId || 5),
      enabled: !!hat.id && !!hat.chainId,
      initialData: _.find(initialHats, ['id', hat.id]),
    })),
  });

  const returnData = _.compact(_.map(hatsDetails, 'data'));

  return chainId ? mapWithChainId(returnData, chainId) : returnData;
};

export default useManyHatDetails;
