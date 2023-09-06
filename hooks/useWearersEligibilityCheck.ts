import { multicall } from '@wagmi/core';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';

const useWearersEligibilityCheck = ({
  wearerIds,
}: useWearersEligibilityCheckProps) => {
  const { chainId, selectedHat } = useTreeForm();
  const hatId = selectedHat?.id || 'none';

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      if (wearerIds.length && hatId && chainId) {
        // Create the contracts array for the multicall
        const contracts = wearerIds.map((wearer) => ({
          address: CONFIG.hatsAddress,
          abi,
          functionName: 'isEligible',
          args: [wearer, hatId],
        }));

        const eligibilities = await multicall({ contracts, chainId } as any);

        const formattedResults = _.chain(eligibilities)
          .map((eligibility, index) => {
            return {
              address: wearerIds[index],
              isEligible: _.get(eligibility, 'result', null),
            };
          })
          .filter('isEligible')
          .value();

        setData(formattedResults as any);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchEligibility();
  }, [wearerIds, hatId, chainId]);

  return { data, isLoading };
};

export default useWearersEligibilityCheck;

interface useWearersEligibilityCheckProps {
  wearerIds: string[];
}
