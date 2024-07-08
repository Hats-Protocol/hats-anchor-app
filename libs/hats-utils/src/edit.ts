import { find, isEmpty, keys, omit, reject, size } from 'lodash';
import { FormData } from 'types';
import { getExcludedFields } from 'utils';
import { Hex } from 'viem';

export const editHasUpdates = (storedData: Partial<FormData>[] | undefined) =>
  !isEmpty(
    reject(storedData, (data: Partial<FormData>) =>
      isEmpty(keys(omit(data, getExcludedFields(false)))),
    ),
  );

export function getProposedChangesCount(
  hatId: Hex,
  data: Partial<FormData>[] | undefined,
): number {
  if (!data) return 0;
  const matchingHat = find(data, {
    id: hatId,
  }) as Partial<FormData> | undefined;

  if (!matchingHat) return 0;

  // Subtracting omit keys that aren't changed/counted in changes
  return size(keys(omit(matchingHat, getExcludedFields(true)))) || 0;
}
