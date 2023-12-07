import { useQueries } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';
import { CONFIG } from 'app-constants';
import { Hat } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

const useWearersEligibilityCheck = ({
  wearerIds,
  selectedHat,
  chainId,
}: useWearersEligibilityCheckProps) => {
  const hatId = selectedHat?.id;

  const eligibilityQueries = useQueries({
    queries: wearerIds.map((wearer) => ({
      queryKey: ['wearerEligibility', wearer, hatId, chainId],
      queryFn: async () => {
        if (hatId && chainId) {
          const eligibility = await readContract({
            address: CONFIG.hatsAddress,
            abi: CONFIG.hatsAbi,
            functionName: 'isEligible',
            args: [wearer, hatId],
            chainId,
          });

          return eligibility ? { address: wearer, isEligible: true } : null;
        }
        return null;
      },
      enabled: !!wearer && !!hatId && !!chainId,
    })),
  });

  const isLoading = _.some(eligibilityQueries, 'isLoading');

  const data = !isLoading
    ? _.compact(_.map(eligibilityQueries, 'data'))
    : undefined;

  return { data, isLoading };
};

export default useWearersEligibilityCheck;

interface useWearersEligibilityCheckProps {
  wearerIds: Hex[];
  selectedHat: Hat;
  chainId: number;
}
