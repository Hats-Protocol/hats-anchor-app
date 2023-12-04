import { useQueries } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { CONFIG } from 'app-utils';
import _ from 'lodash';
import { Hex } from 'viem';

import { useTreeForm } from '../contexts/TreeFormContext';

// hats-hooks
const useWearersEligibilityCheck = ({
  wearerIds,
}: useWearersEligibilityCheckProps) => {
  const { chainId, selectedHat } = useTreeForm();
  const hatId = selectedHat?.id || 'none';

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
      enabled: !!wearer && hatId !== 'none' && !!chainId,
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
}
