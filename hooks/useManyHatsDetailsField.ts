import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';

import { handleNestedDetails } from '@/lib/details';
import { fetchDetailsIpfs } from '@/lib/ipfs';
import { Hat } from '@/types';

// * should keep fetching strategy inline with `useHatDetailsField.ts`

// details-sdk/hooks
const useManyHatsDetailsField = ({
  hats,
  onchainHats,
  editMode,
  onchain,
}: {
  hats: Hat[] | undefined;
  onchainHats?: Hat[];
  editMode?: boolean;
  onchain?: boolean;
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
      queryKey: [
        'hatDetailsField',
        hat?.details,
        { onchain: onchain || false },
      ],
      queryFn: () => fetchDetailsIpfs(hat?.details),
      enabled: !!hat?.details,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });

  const result = {
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
  return result;
};

export default useManyHatsDetailsField;
