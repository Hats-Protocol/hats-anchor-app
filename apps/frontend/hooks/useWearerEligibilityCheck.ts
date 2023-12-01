import { Hex, isAddress } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';

// TODO migrate to `useWearersEligibilityCheck`

// hats-hooks
const useWearerEligibilityCheck = ({
  wearer,
}: useWearerEligibilityCheckProps) => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isEligible',
    args: [wearer, hatId],
    enabled:
      Boolean(wearer) &&
      isAddress(wearer || '0x') &&
      Boolean(hatId) &&
      Boolean(chainId),
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useWearerEligibilityCheck;

interface useWearerEligibilityCheckProps {
  wearer: Hex | undefined;
}
