import { useQueries } from '@tanstack/react-query';
import { handleNestedDetails } from 'hats-utils';
import _ from 'lodash';
import { AppHat } from 'types';
import { fetchDetailsIpfs } from 'utils';

// * should keep fetching strategy inline with `useHatDetailsField.ts`

// details-sdk/hooks
const useManyHatsDetailsField = ({
  hats,
  onchainHats,
  editMode,
  onchain,
}: {
  hats: AppHat[] | undefined;
  onchainHats?: AppHat[];
  editMode?: boolean;
  onchain?: boolean;
}) => {
  let onlyOnchainHats = hats;
  if (onchainHats) {
    onlyOnchainHats = _.filter(hats, (hat: AppHat) =>
      _.includes(_.map(onchainHats, 'id'), hat?.id),
    );
  }

  const filteredDetails = _.reject(
    onlyOnchainHats,
    (hat: AppHat) =>
      !_.startsWith(_.get(hat, 'details'), 'ipfs://') ||
      _.get(hat, 'details') === '',
  );

  const detailsFields = useQueries({
    queries: _.map(filteredDetails, (hat: AppHat) => ({
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
      _.map(onlyOnchainHats, (hat: AppHat) => {
        const detailsData =
          _.find(detailsFields, ['details', hat.details]) ||
          _.find(_.map(detailsFields, 'data'), ['details', hat.details]);

        const detailsObject = handleNestedDetails(detailsData);
        if (!detailsObject) return undefined;

        return {
          id: hat?.details || '0x',
          detailsObject,
        };
      }),
    ),
    isLoading: _.some(detailsFields, 'isLoading'),
  };
  return result;
};

export default useManyHatsDetailsField;
