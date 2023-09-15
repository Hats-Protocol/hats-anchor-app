import { useQueries } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import _ from 'lodash';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';

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
            abi,
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
  wearerIds: string[];
}
