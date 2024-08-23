'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWearersEligibilities } from 'hats-utils';
import { map } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Hex } from 'viem';

/** `useWearersEligibilityStatus` is a hook that checks the eligibility status of wearers for a given hat.
 * @param selectedHat - The selected hat
 * @param wearerIds - An optional list of wearer ids (will use the selected hat's wearers if not provided)
 * @param chainId - The chain id for the hat, generally
 * @param editMode - Whether the hook is being used in edit mode (turn off refetch)
 */
const useWearersEligibilityStatus = ({
  selectedHat,
  wearerIds,
  chainId,
  editMode = false,
}: useWearersEligibilityStatusProps) => {
  const hatId = selectedHat?.id;
  const wearers = selectedHat?.wearers;
  const localWearerIds = wearerIds || map(wearers, 'id');

  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerEligibility', localWearerIds, hatId, chainId],
    queryFn: () =>
      hatId && chainId
        ? fetchWearersEligibilities(localWearerIds, hatId, chainId)
        : null,
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
    enabled: !!hatId && !!chainId,
  });

  return { data, isLoading, error };
};

export default useWearersEligibilityStatus;

interface useWearersEligibilityStatusProps {
  selectedHat: AppHat | undefined;
  wearerIds?: Hex[];
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}
