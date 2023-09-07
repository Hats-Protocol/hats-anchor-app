import { Hex } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';

const useWearerEligibilityCheck = ({
  wearer,
}: useWearerEligibilityCheckProps) => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isEligible',
    args: [wearer, hatId],
    enabled: Boolean(wearer) && Boolean(hatId) && Boolean(chainId),
  });

  return { data, isLoading };
};

export default useWearerEligibilityCheck;

interface useWearerEligibilityCheckProps {
  wearer: Hex | undefined;
}
