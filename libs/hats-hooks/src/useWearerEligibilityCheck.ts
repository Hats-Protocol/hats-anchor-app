'use client';

import { CONFIG } from '@hatsprotocol/constants';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useReadContract } from 'wagmi';

/**
 * *** DEPRECATED use `useWearersEligibilityCheck` ***
 */
const useWearerEligibilityCheck = ({
  wearer,
  selectedHat,
  chainId,
}: useWearerEligibilityCheckProps) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isEligible',
    args: [wearer, hatId],
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useWearerEligibilityCheck;

interface useWearerEligibilityCheckProps {
  wearer: Hex | undefined;
  selectedHat?: AppHat;
  chainId?: number;
}
