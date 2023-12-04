import { Hex, isAddress } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/utils/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';

// hats-hooks
const useWearerIsInGoodStanding = ({ wearer }: UseWearerIsInGoodStanding) => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
    enabled: !!wearer && isAddress(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
}
