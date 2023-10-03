import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';

import { handleNestedDetails } from '@/lib/details';
import { fetchDetailsIpfs } from '@/lib/ipfs';
import { Hat } from '@/types';

// ? should keep fetching strategy inline with `useHatDetailsField.ts`

const useManyHatsDetailsField = ({
  hats,
  onchainHats,
}: {
  hats: Hat[] | undefined;
  onchainHats?: Hat[];
}) => {
  let onlyOnchainHats = hats;
  if (onchainHats) {
    onlyOnchainHats = _.filter(hats, (hat) =>
      _.includes(_.map(onchainHats, 'id'), hat?.id),
    );
  }

  const filteredDetails = _.reject(
    onlyOnchainHats,
    (hat) =>
      !_.startsWith(_.get(hat, 'details'), 'ipfs://') && hat?.details !== '',
  );

  const detailsFields = useQueries({
    queries: _.map(filteredDetails, (hat) => ({
      queryKey: ['hatDetailsField', hat?.details],
      queryFn: () => fetchDetailsIpfs(hat?.details),
      enabled: !!hat?.details,
    })),
  });

  return {
    data: _.compact(
      _.map(onlyOnchainHats, (hat) => {
        const detailsData =
          _.find(detailsFields, ['details', hat.details]) ||
          _.find(_.map(detailsFields, 'data'), ['details', hat.details]);

        const detailsObject = handleNestedDetails(detailsData);
        if (!detailsObject) return undefined;

        return {
          id: hat?.details,
          detailsObject,
        };
      }),
    ),
    isLoading: _.some(detailsFields, 'isLoading'),
  };
};

export default useManyHatsDetailsField;
