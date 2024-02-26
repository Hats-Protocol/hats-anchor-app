import { CONFIG } from '@hatsprotocol/constants';
import { AppHat } from 'hats-types';
import { Hex, isAddress } from 'viem';
import { useContractRead } from 'wagmi';

// TODO migrate to `useWearersEligibilityCheck`

const useWearerEligibilityCheck = ({
  wearer,
  selectedHat,
  chainId,
}: useWearerEligibilityCheckProps) => {
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
  selectedHat?: AppHat;
  chainId?: number;
}
