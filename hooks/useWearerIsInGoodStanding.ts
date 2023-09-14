import { Hex, isAddress } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';

const useWearerIsInGoodStanding = ({ wearer }: UseWearerIsInGoodStanding) => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
    enabled: wearer && isAddress(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
}
