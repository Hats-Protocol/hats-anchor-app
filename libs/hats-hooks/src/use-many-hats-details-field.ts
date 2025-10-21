import { useQueries } from '@tanstack/react-query';
import { handleNestedDetails } from 'hats-utils';
import { compact, filter, find, get, includes, map, reject, some, startsWith } from 'lodash';
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
    onlyOnchainHats = filter(hats, (hat: AppHat) => includes(map(onchainHats, 'id'), hat?.id));
  }

  const filteredDetails = reject(
    onlyOnchainHats,
    (hat: AppHat) => get(hat, 'details') === '',
  );

  const detailsFields = useQueries({
    queries: map(filteredDetails, (hat: AppHat) => ({
      queryKey: ['hatDetailsField', hat?.details, { onchain: onchain || false }],
      queryFn: () => fetchDetailsIpfs(hat?.details),
      enabled: !!hat?.details,
      refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    })),
  });

  const result = {
    data: compact(
      map(onlyOnchainHats, (hat: AppHat) => {
        const detailsData =
          find(detailsFields, ['details', hat.details]) || find(map(detailsFields, 'data'), ['details', hat.details]);

        const detailsObject = handleNestedDetails(detailsData);
        if (!detailsObject) return undefined;

        return {
          id: hat?.details || '0x',
          detailsObject,
        };
      }),
    ),
    isLoading: some(detailsFields, 'isLoading'),
  };
  return result;
};

export { useManyHatsDetailsField };
