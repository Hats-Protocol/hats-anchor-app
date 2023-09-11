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
    queries: _.map(hats, (hat) => {
      const hatDetails = _.pick(hat, ['id', 'chainId', 'details', 'imageUri']);

      return {
        queryKey: ['hatDetails', hatDetails],
        queryFn: () => fetchHatDetails(hat.id, hat.chainId || 5),
        enabled: !!hat.id && !!hat.chainId && !!hat.details && !!hat.imageUri,
        initialData: _.find(initialHats, ['id', hat.id]),
      };
    }),
  });

  const returnData = _.compact(_.map(hatsDetails, 'data'));

  return chainId ? mapWithChainId(returnData, chainId) : returnData;
};

export default useManyHatDetails;
