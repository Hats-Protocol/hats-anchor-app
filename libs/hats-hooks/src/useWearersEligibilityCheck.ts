import { CONFIG } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { readContract } from 'wagmi/actions';

const fetchWearersEligibility = async (
  wearerIds: Hex[],
  hatId: Hex,
  chainId: number,
) => {
  const eligibilityQueries = _.map(wearerIds, (wearer: Hex) =>
    readContract({
      address: CONFIG.hatsAddress,
      abi: CONFIG.hatsAbi,
      functionName: 'isEligible',
      args: [wearer, hatId],
      chainId,
    }),
  );
  const eligibilityData = await Promise.all(eligibilityQueries);

  const eligibleWearers = _.filter(wearerIds, (__: unknown, index: number) => {
    return eligibilityData[index];
  });
  const ineligibleWearers = _.filter(
    wearerIds,
    (__: unknown, index: number) => {
      return !eligibilityData[index];
    },
  );

  return { eligibleWearers, ineligibleWearers };
};

/** `useWearersEligibilityCheck` is a hook that checks the eligibility of wearers for a given hat.
 * @param selectedHat - The selected hat
 * @param wearerIds - An optional list of wearer ids (will use the selected hat's wearers if not provided)
 * @param chainId - The chain id for the hat, generally
 * @param editMode - Whether the hook is being used in edit mode (turn off refetch)
 */
const useWearersEligibilityCheck = ({
  selectedHat,
  wearerIds,
  chainId,
  editMode = false,
}: useWearersEligibilityCheckProps) => {
  const hatId = selectedHat?.id;
  const wearers = selectedHat?.wearers;
  const localWearerIds = wearerIds || _.map(wearers, 'id');

  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerEligibility', localWearerIds, hatId, chainId],
    queryFn: () => fetchWearersEligibility(localWearerIds, hatId, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
  });

  return { data, isLoading, error };
};

export default useWearersEligibilityCheck;

interface useWearersEligibilityCheckProps {
  selectedHat: AppHat;
  wearerIds?: Hex[];
  chainId: number;
  editMode?: boolean;
}
